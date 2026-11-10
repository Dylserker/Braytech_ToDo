import { useEffect, useState, type FormEvent } from 'react'
import Button from '../Buttons/Buttons'
import ComboBox from '../ComboBox/ComboBox'
import Modal from '../Modals/Modal'
import { DESTINY_CATEGORIES, type DestinyCategory } from '../../constants/destinyCategories'
import { useTasks } from '../../context/TaskContext'
import type { Task } from '../../types/task'

type TaskModalProps = {
  isOpen: boolean
  task?: Task
  taskIndex?: number
  onClose: () => void
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
  const [category, setCategory] = useState<DestinyCategory | ''>('')
  const [mission, setMission] = useState('')
  const [difficulty, setDifficulty] = useState('')
  const [taskDate, setTaskDate] = useState('')
  const [taskTime, setTaskTime] = useState('')

  useEffect(() => {
    const dateTime = getLocalDateTimeValues(task?.createdAt)
    setTitle(task?.title ?? '')
    setDescription(task?.description ?? '')
    setCategory(task?.category ?? '')
    setMission(task?.mission ?? '')
    setDifficulty(task?.difficulty ?? '')
    setTaskDate(dateTime.date)
    setTaskTime(dateTime.time)
  }, [task, isOpen])

  const missions = category ? DESTINY_CATEGORIES[category] : []
  const selectedMission = missions.find((item) => item.name === mission)
  const difficulties = selectedMission && 'difficulties' in selectedMission
    ? selectedMission.difficulties
    : []
  const minimumDateTime = getMinimumDateTimeValues()
  const isCreatingInThePast =
    taskIndex === undefined && new Date(`${taskDate}T${taskTime}`) < new Date()

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
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
    const nextTask = {
      title: title.trim(),
      description: description.trim(),
      category,
      mission,
      difficulty,
      createdAt: new Date(`${taskDate}T${taskTime}`).toISOString(),
    }
    if (taskIndex === undefined) addTask(nextTask)
    else updateTask(taskIndex, nextTask)
    onClose()
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
          <ComboBox id="task-category" label="Catégorie" required value={category}
            onChange={(event) => { setCategory(event.target.value as DestinyCategory | ''); setMission(''); setDifficulty('') }}>
            <option value="">Sélectionner</option>
            {Object.keys(DESTINY_CATEGORIES).map((item) => <option key={item} value={item}>{item}</option>)}
          </ComboBox>
          <ComboBox id="task-mission" label="Mission" required disabled={!category} value={mission}
            onChange={(event) => { setMission(event.target.value); setDifficulty('') }}>
            <option value="">{category ? 'Sélectionner' : 'Choisir une catégorie'}</option>
            {missions.map((item) => <option key={item.name} value={item.name}>{item.name}</option>)}
          </ComboBox>
          <ComboBox id="task-difficulty" label="Difficulté" required={difficulties.length > 0}
            disabled={!mission || difficulties.length === 0} value={difficulty} onChange={(event) => setDifficulty(event.target.value)}>
            <option value="">{!mission ? 'Choisir une mission' : difficulties.length === 0 ? 'Aucune variante' : 'Sélectionner'}</option>
            {difficulties.map((item) => <option key={item} value={item}>{item}</option>)}
          </ComboBox>
        </div>
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
