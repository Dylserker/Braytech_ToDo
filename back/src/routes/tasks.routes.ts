import { Router, type Request, type Response } from 'express'
import { z } from 'zod'
import mysql from 'mysql2/promise'
import { database } from '../database.js'
import { getAuthenticatedSession } from './bungie-auth.routes.js'

const tasksRouter = Router()

const activitySchema = z.object({
  bungieActivityHash: z.number().int().nonnegative(),
  name: z.string().trim().min(1).max(255),
  category: z.string().trim().min(1).max(80),
  difficulty: z.string().trim().max(80).nullable(),
  variant: z.string().trim().max(120).nullable(),
})

const taskSchema = z.object({
  title: z.string().trim().min(1).max(255),
  description: z.string().trim().max(65_535),
  difficulty: z.string().trim().max(80),
  createdAt: z.string().datetime(),
  activity: activitySchema,
})

function requireSession(request: Request, response: Response) {
  const session = getAuthenticatedSession(request)
  if (!session) {
    response.status(401).json({ error: 'Authentication required' })
    return null
  }
  return session
}

async function getActivityDefinitionId(activity: z.infer<typeof activitySchema>) {
  const [result] = await database.execute<mysql.ResultSetHeader>(
    `INSERT INTO activity_definitions
      (bungie_activity_hash, name, category, difficulty, variant, is_verifiable)
      VALUES (?, ?, ?, ?, ?, 1)
      ON DUPLICATE KEY UPDATE
        id = LAST_INSERT_ID(id),
        name = VALUES(name),
        category = VALUES(category),
        difficulty = VALUES(difficulty),
        variant = VALUES(variant),
        updated_at = CURRENT_TIMESTAMP(3)`,
    [
      activity.bungieActivityHash,
      activity.name,
      activity.category,
      activity.difficulty,
      activity.variant,
    ],
  )
  return result.insertId
}

tasksRouter.get('/', async (request, response, next) => {
  const session = requireSession(request, response)
  if (!session) return
  try {
    const [rows] = await database.execute<mysql.RowDataPacket[]>(
      `SELECT tasks.id, tasks.title, tasks.description, tasks.category, tasks.mission,
        tasks.difficulty, tasks.created_at, activity_definitions.bungie_activity_hash,
        activity_definitions.variant
       FROM tasks
       LEFT JOIN activity_definitions ON activity_definitions.id = tasks.activity_definition_id
       WHERE tasks.user_id = ? ORDER BY tasks.created_at ASC`,
      [session.userId],
    )
    response.json(rows.map((task) => ({
      id: task.id,
      title: task.title,
      description: task.description ?? '',
      category: task.category,
      mission: task.mission,
      difficulty: task.difficulty ?? '',
      createdAt: new Date(task.created_at).toISOString(),
      activityDefinitionId: task.activity_definition_id,
      activityHash: task.bungie_activity_hash,
      activityVariant: task.variant,
    })))
  } catch (error) {
    next(error)
  }
})

tasksRouter.post('/', async (request, response, next) => {
  const session = requireSession(request, response)
  if (!session) return
  const parsed = taskSchema.safeParse(request.body)
  if (!parsed.success) {
    response.status(400).json({ error: 'Invalid task payload', details: parsed.error.flatten() })
    return
  }
  try {
    const { activity, ...task } = parsed.data
    const activityDefinitionId = await getActivityDefinitionId(activity)
    const [result] = await database.execute<mysql.ResultSetHeader>(
      `INSERT INTO tasks
        (user_id, activity_definition_id, title, description, category, mission, difficulty, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        session.userId,
        activityDefinitionId,
        task.title,
        task.description || null,
        activity.category,
        activity.name,
        task.difficulty || activity.difficulty,
        new Date(task.createdAt),
      ],
    )
    response.status(201).json({ id: result.insertId, ...task, category: activity.category, mission: activity.name, activityDefinitionId })
  } catch (error) {
    next(error)
  }
})

tasksRouter.patch('/:id', async (request, response, next) => {
  const session = requireSession(request, response)
  if (!session) return
  const taskId = Number(request.params.id)
  const parsed = taskSchema.safeParse(request.body)
  if (!Number.isSafeInteger(taskId) || !parsed.success) {
    response.status(400).json({ error: 'Invalid task payload' })
    return
  }
  try {
    const { activity, ...task } = parsed.data
    const activityDefinitionId = await getActivityDefinitionId(activity)
    const [result] = await database.execute<mysql.ResultSetHeader>(
      `UPDATE tasks SET activity_definition_id = ?, title = ?, description = ?, category = ?,
        mission = ?, difficulty = ?, created_at = ? WHERE id = ? AND user_id = ?`,
      [
        activityDefinitionId,
        task.title,
        task.description || null,
        activity.category,
        activity.name,
        task.difficulty || activity.difficulty,
        new Date(task.createdAt),
        taskId,
        session.userId,
      ],
    )
    if (result.affectedRows === 0) {
      response.status(404).json({ error: 'Task not found' })
      return
    }
    response.json({ id: taskId, ...task, category: activity.category, mission: activity.name, activityDefinitionId })
  } catch (error) {
    next(error)
  }
})

tasksRouter.delete('/:id', async (request, response, next) => {
  const session = requireSession(request, response)
  if (!session) return
  const taskId = Number(request.params.id)
  if (!Number.isSafeInteger(taskId)) {
    response.status(400).json({ error: 'Invalid task id' })
    return
  }
  try {
    const [result] = await database.execute<mysql.ResultSetHeader>(
      'DELETE FROM tasks WHERE id = ? AND user_id = ?',
      [taskId, session.userId],
    )
    if (result.affectedRows === 0) {
      response.status(404).json({ error: 'Task not found' })
      return
    }
    response.status(204).send()
  } catch (error) {
    next(error)
  }
})

export default tasksRouter
