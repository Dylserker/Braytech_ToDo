import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { apiRequest } from '../functions/api'
import type { Task } from '../types/task'

type TaskContextValue = {
  tasks: Task[]
  addTask: (task: Task) => Promise<void>
  updateTask: (index: number, task: Task) => Promise<void>
  removeTask: (index: number) => Promise<void>
}

const TaskContext = createContext<TaskContextValue | null>(null)

export function TaskProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([])

  useEffect(() => {
    let active = true
    apiRequest('/tasks')
      .then(async (response) => {
        const nextTasks = await response.json() as Task[]
        if (active) setTasks(nextTasks)
      })
      .catch((error: unknown) => {
        if (error instanceof Error && error.message.includes('(401)')) return
        console.error('Unable to load tasks', error)
      })
    return () => { active = false }
  }, [])

  const value = useMemo(
    () => ({
      tasks,
      addTask: async (task: Task) => {
        const response = await apiRequest('/tasks', {
          method: 'POST',
          body: JSON.stringify({
            title: task.title,
            description: task.description,
            difficulty: task.difficulty,
            createdAt: task.createdAt,
            activity: {
              bungieActivityHash: task.activityHash,
              name: task.mission,
              category: task.category,
              difficulty: task.difficulty || null,
              variant: task.activityVariant ?? null,
            },
          }),
        })
        const createdTask = await response.json() as Task
        setTasks((current) => [...current, createdTask])
      },
      updateTask: async (index: number, task: Task) => {
        if (task.id === undefined || task.activityHash === undefined) throw new Error('Activité Bungie manquante')
        const response = await apiRequest(`/tasks/${task.id}`, {
          method: 'PATCH',
          body: JSON.stringify({
            title: task.title,
            description: task.description,
            difficulty: task.difficulty,
            createdAt: task.createdAt,
            activity: {
              bungieActivityHash: task.activityHash,
              name: task.mission,
              category: task.category,
              difficulty: task.difficulty || null,
              variant: task.activityVariant ?? null,
            },
          }),
        })
        const updatedTask = await response.json() as Task
        setTasks((current) => current.map((item, itemIndex) => itemIndex === index ? updatedTask : item))
      },
      removeTask: async (index: number) => {
        const task = tasks[index]
        if (task?.id === undefined) throw new Error('Identifiant de tâche manquant')
        await apiRequest(`/tasks/${task.id}`, { method: 'DELETE' })
        setTasks((current) => current.filter((_, itemIndex) => itemIndex !== index))
      },
    }),
    [tasks],
  )

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>
}

export function useTasks() {
  const context = useContext(TaskContext)
  if (!context) throw new Error('useTasks must be used within TaskProvider')
  return context
}
