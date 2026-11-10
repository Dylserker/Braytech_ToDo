import { useState, type FormEvent } from 'react'
import Button from '../../components/Buttons/Buttons'
import ComboBox from '../../components/ComboBox/ComboBox'
import Header from '../../components/Header/Header'
import Modal from '../../components/Modals/Modal'
import { DESTINY_CATEGORIES, type DestinyCategory } from '../../constants/destinyCategories'
import './Home.css'

type Task = {
  title: string
  description: string
  category: DestinyCategory
  difficulty: string
  mission: string
}

function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [taskTitle, setTaskTitle] = useState('')
  const [taskDescription, setTaskDescription] = useState('')
  const [category, setCategory] = useState<DestinyCategory | ''>('')
  const [difficulty, setDifficulty] = useState('')
  const [mission, setMission] = useState('')
  const [tasks, setTasks] = useState<Task[]>([])
  const [editingTaskIndex, setEditingTaskIndex] = useState<number | null>(null)

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const title = taskTitle.trim()
    const selectedMission = category
      ? DESTINY_CATEGORIES[category].find((missionOption) => missionOption.name === mission)
      : undefined
    const missionNeedsDifficulty =
      selectedMission && 'difficulties' in selectedMission
        ? selectedMission.difficulties.length > 0
        : false
    if (!title || !category || !mission || (missionNeedsDifficulty && !difficulty)) return

    const task = { title, description: taskDescription.trim(), category, difficulty, mission }
    setTasks((currentTasks) =>
      editingTaskIndex === null
        ? [...currentTasks, task]
        : currentTasks.map((currentTask, index) =>
            index === editingTaskIndex ? task : currentTask,
          ),
    )
    setEditingTaskIndex(null)
    setTaskTitle('')
    setTaskDescription('')
    setCategory('')
    setDifficulty('')
    setMission('')
    setIsModalOpen(false)
  }

  const handleCategoryChange = (value: DestinyCategory | '') => {
    setCategory(value)
    setDifficulty('')
    setMission('')
  }

  const openNewTaskModal = () => {
    setEditingTaskIndex(null)
    setTaskTitle('')
    setTaskDescription('')
    setCategory('')
    setDifficulty('')
    setMission('')
    setIsModalOpen(true)
  }

  const openEditTaskModal = (task: Task, index: number) => {
    setEditingTaskIndex(index)
    setTaskTitle(task.title)
    setTaskDescription(task.description)
    setCategory(task.category)
    setDifficulty(task.difficulty)
    setMission(task.mission)
    setIsModalOpen(true)
  }

  const removeTask = (indexToRemove: number) => {
    setTasks((currentTasks) => currentTasks.filter((_, index) => index !== indexToRemove))
  }

  const missions = category ? DESTINY_CATEGORIES[category] : []
  const selectedMission = missions.find((missionOption) => missionOption.name === mission)
  const difficulties =
    selectedMission && 'difficulties' in selectedMission ? selectedMission.difficulties : []

  return (
    <>
      <Header />
      <main className="home">
        <p className="home__eyebrow">BRAYTECH / PLANNING</p>
        <h1>Votre planning</h1>
        <p className="home__intro">Organisez vos prochaines missions avec précision.</p>
        <Button type="button" onClick={openNewTaskModal}>
          + Nouvelle tâche
        </Button>

        {tasks.length > 0 && (
          <section className="home__tasks" aria-label="Tâches créées">
            {tasks.map((task, index) => (
              <article className="task-card" key={`${task.title}-${index}`}>
                <span className="task-card__index">{String(index + 1).padStart(2, '0')}</span>
                <div className="task-card__content">
                  <strong>{task.title}</strong>
                  <span>
                    {task.category} / {task.difficulty ? `${task.difficulty} / ` : ''}
                    {task.mission}
                  </span>
                </div>
                <div className="task-card__actions">
                  <Button
                    className="task-card__action"
                    type="button"
                    variant="secondary"
                    onClick={() => openEditTaskModal(task, index)}
                  >
                    Modifier
                  </Button>
                  <Button
                    className="task-card__action"
                    type="button"
                    variant="danger"
                    onClick={() => removeTask(index)}
                  >
                    Supprimer
                  </Button>
                </div>
              </article>
            ))}
          </section>
        )}
      </main>
      <Modal
        eyebrow={editingTaskIndex === null ? 'Nouvelle entrée' : 'Modification'}
        isOpen={isModalOpen}
        title={editingTaskIndex === null ? 'Créer une tâche' : 'Modifier la tâche'}
        onClose={() => setIsModalOpen(false)}
      >
        <form className="task-form" onSubmit={handleSubmit}>
          <div className="task-form__field">
            <label htmlFor="task-title">Titre</label>
            <input
              id="task-title"
              required
              value={taskTitle}
              onChange={(event) => setTaskTitle(event.target.value)}
              placeholder="Ex. Préparer la prochaine mission"
            />
          </div>
          <div className="task-form__grid">
            <ComboBox
              id="task-category"
              label="Catégorie"
              required
              value={category}
              onChange={(event) =>
                handleCategoryChange(event.target.value as DestinyCategory | '')
              }
            >
              <option value="">Sélectionner</option>
              {Object.keys(DESTINY_CATEGORIES).map((categoryOption) => (
                <option key={categoryOption} value={categoryOption}>
                  {categoryOption}
                </option>
              ))}
            </ComboBox>
            <ComboBox
              id="task-mission"
              label="Mission"
              required
              disabled={!category}
              value={mission}
              onChange={(event) => {
                setMission(event.target.value)
                setDifficulty('')
              }}
            >
              <option value="">{category ? 'Sélectionner' : 'Choisir une catégorie'}</option>
              {missions.map((missionOption) => (
                <option key={missionOption.name} value={missionOption.name}>
                  {missionOption.name}
                </option>
              ))}
            </ComboBox>
            <ComboBox
              id="task-difficulty"
              label="Difficulté"
              required={difficulties.length > 0}
              disabled={!mission || difficulties.length === 0}
              value={difficulty}
              onChange={(event) => setDifficulty(event.target.value)}
            >
              <option value="">
                {!mission
                  ? 'Choisir une mission'
                  : difficulties.length === 0
                    ? 'Aucune variante'
                    : 'Sélectionner'}
              </option>
              {difficulties.map((difficultyOption) => (
                <option key={difficultyOption} value={difficultyOption}>
                  {difficultyOption}
                </option>
              ))}
            </ComboBox>
          </div>
          <div className="task-form__field">
            <label htmlFor="task-description">Description</label>
            <textarea
              id="task-description"
              value={taskDescription}
              onChange={(event) => setTaskDescription(event.target.value)}
              placeholder="Ajoutez quelques détails..."
            />
          </div>
          <div className="task-form__actions">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
              Annuler
            </Button>
            <Button type="submit">
              {editingTaskIndex === null ? 'Créer la tâche' : 'Enregistrer'}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  )
}

export default Home