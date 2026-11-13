import { useEffect, useState, type FormEvent } from 'react'
import Button from '../Buttons/Buttons'
import ComboBox from '../ComboBox/ComboBox'
import Modal from '../Modals/Modal'
import { useTasks } from '../../context/TaskContext'
import { apiRequest } from '../../functions/api'
import type { Task } from '../../types/task'

type TaskModalProps = {
  isOpen: boolean
  task?: Task
  taskIndex?: number
  onClose: () => void
}

type Activity = {
  id: number
  name: string
  category: string
  difficulties: string[]
}

function getLocalDateTimeValues(value?: string) {
  const date = value ? new Date(value) : new Date()
  const pad = (part: number) => String(part).padStart(2, '0')
  return {
    date: `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`,
    time: `${pad(date.getHours())}:${pad(date.getMinutes())}`,
  }
}

function getMinimumDateTimeValues() {
  return getLocalDateTimeValues()
}

function TaskModal({ isOpen, task, taskIndex, onClose }: TaskModalProps) {
  const { addTask, updateTask } = useTasks()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [mission, setMission] = useState('')
  const [difficulty, setDifficulty] = useState('')
  const [taskDate, setTaskDate] = useState('')
  const [taskTime, setTaskTime] = useState('')
  const [activitiesByCategory, setActivitiesByCategory] = useState<Record<string, Activity[]>>({})
  const [catalogError, setCatalogError] = useState('')
  const [submitError, setSubmitError] = useState('')

  useEffect(() => {
    const dateTime = getLocalDateTimeValues(task?.createdAt)
    setTitle(task?.title ?? '')
    setDescription(task?.description ?? '')
    setCategory(task?.category ?? '')
    setMission(task?.mission ?? '')
    setDifficulty(task?.difficulty ?? '')
    setTaskDate(dateTime.date)
    setTaskTime(dateTime.time)
    setSubmitError('')
  }, [task, isOpen])

  useEffect(() => {
    if (!isOpen || Object.keys(activitiesByCategory).length > 0) return
    apiRequest('/activities')
      .then(async (response) => {
        const payload = await response.json() as { categories: Record<string, Activity[]> }
        setActivitiesByCategory(payload.categories)
      })
      .catch((error: unknown) => {
        setCatalogError(error instanceof Error ? error.message : 'Le catalogue Bungie est indisponible')
      })
  }, [activitiesByCategory, isOpen])

  const activities = category ? activitiesByCategory[category] ?? [] : []
  const categories = Object.keys(activitiesByCategory)
  const selectedActivity = activities.find((item) => item.name === mission)
  const difficulties = selectedActivity?.difficulties ?? []
  const minimumDateTime = getMinimumDateTimeValues()
  const isCreatingInThePast =
    taskIndex === undefined && new Date(`${taskDate}T${taskTime}`) < new Date()

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (
      !title.trim() ||
      !category ||
      !mission ||
      !taskDate ||
      !taskTime ||
      isCreatingInThePast ||
      (difficulties.length > 0 && !difficulty)
    ) return
    const activityHash = selectedActivity?.id ?? task?.activityHash
    if (activityHash === undefined) {
      setSubmitError('Cette activité Bungie ne possède pas d’identifiant exploitable.')
      return
    }
    const nextTask: Task = {
      title: title.trim(),
      description: description.trim(),
      category,
      mission,
      difficulty,
      createdAt: new Date(`${taskDate}T${taskTime}`).toISOString(),
      activityHash,
      activityVariant: null,
    }
    try {
      if (taskIndex === undefined) await addTask(nextTask)
      else await updateTask(taskIndex, { ...nextTask, id: task?.id })
      onClose()
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'La tâche n’a pas pu être enregistrée')
    }
  }

  return (
    <Modal
      eyebrow={taskIndex === undefined ? 'Nouvelle entrée' : 'Modification'}
      isOpen={isOpen}
      title={taskIndex === undefined ? 'Créer une tâche' : 'Modifier la tâche'}
      onClose={onClose}
    >
      <form className="task-form" onSubmit={handleSubmit}>
        <div className="task-form__field">
          <label htmlFor="task-title">Titre</label>
          <input id="task-title" required value={title} onChange={(event) => setTitle(event.target.value)} />
        </div>
        <div className="task-form__grid">
          <ComboBox id="task-category" label="Catégorie d’activité" required value={category}
            onChange={(event) => { setCategory(event.target.value); setMission(''); setDifficulty('') }}>
            <option value="">Sélectionner</option>
            {categories.map((item) => (
              <option key={item} value={item}>{item} ({activitiesByCategory[item]?.length ?? 0})</option>
            ))}
          </ComboBox>
          <ComboBox id="task-mission" label="Activité" required disabled={!category} value={mission}
            onChange={(event) => { setMission(event.target.value); setDifficulty('') }}>
            <option value="">{category ? 'Sélectionner' : 'Choisir une catégorie'}</option>
            {activities.map((item) => <option key={item.id} value={item.name}>{item.name}</option>)}
          </ComboBox>
          <ComboBox id="task-difficulty" label="Difficulté" required={difficulties.length > 0}
            disabled={!mission || difficulties.length === 0} value={difficulty} onChange={(event) => setDifficulty(event.target.value)}>
            <option value="">{!mission ? 'Choisir une mission' : difficulties.length === 0 ? 'Aucune variante' : 'Sélectionner'}</option>
            {difficulties.map((item) => <option key={item} value={item}>{item}</option>)}
          </ComboBox>
        </div>
        {catalogError && <p role="alert">{catalogError}</p>}
        {submitError && <p role="alert">{submitError}</p>}
        <div className="task-form__grid task-form__datetime">
          <div className="task-form__field">
            <label htmlFor="task-date">Journée</label>
            <input
              id="task-date"
              type="date"
              required
              min={taskIndex === undefined ? minimumDateTime.date : undefined}
              value={taskDate}
              onChange={(event) => setTaskDate(event.target.value)}
            />
          </div>
          <div className="task-form__field">
            <label htmlFor="task-time">Heure</label>
            <input
              id="task-time"
              type="time"
              required
              min={
                taskIndex === undefined && taskDate === minimumDateTime.date
                  ? minimumDateTime.time
                  : undefined
              }
              value={taskTime}
              onChange={(event) => setTaskTime(event.target.value)}
            />
          </div>
        </div>
        <div className="task-form__field">
          <label htmlFor="task-description">Description</label>
          <textarea id="task-description" value={description} onChange={(event) => setDescription(event.target.value)} />
        </div>
        <div className="task-form__actions">
          <Button type="button" variant="secondary" onClick={onClose}>Annuler</Button>
          <Button type="submit">{taskIndex === undefined ? 'Créer la tâche' : 'Enregistrer'}</Button>
        </div>
      </form>
    </Modal>
  )
}

export default TaskModal
