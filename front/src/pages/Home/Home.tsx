import { useState } from 'react'
import Button from '../../components/Buttons/Buttons'
import Card from '../../components/Cards/Cards'
import Achievements from '../../components/Achievements/Achievements'
import Header from '../../components/Header/Header'
import Footer from '../../components/Footer/Footer'
import TaskModal from '../../components/TaskModal/TaskModal'
import { useTasks } from '../../context/TaskContext'
import HomeLayout from '../../layouts/HomeLayout/HomeLayout'
import './Home.css'

function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { tasks, removeTask } = useTasks()
  const [editingTaskIndex, setEditingTaskIndex] = useState<number | null>(null)

  const openNewTaskModal = () => {
    setEditingTaskIndex(null)
    setIsModalOpen(true)
  }

  const openEditTaskModal = (index: number) => {
    setEditingTaskIndex(index)
    setIsModalOpen(true)
  }

  return (
    <>
      <Header />
      <main className="home">
        <p className="home__eyebrow">BRAYTECH / HOME</p>
        <div className="home__heading">
          <div>
            <h1>Centre de contrôle</h1>
            <p className="home__intro">Suivez vos tâches et votre progression.</p>
          </div>
          <Button type="button" onClick={openNewTaskModal}>
            + Nouvelle tâche
          </Button>
        </div>

        <HomeLayout>
          <section className="home__section" aria-labelledby="today-title">
            <div className="home__section-heading">
              <p className="home__section-eyebrow">01 / JOUR ACTUEL</p>
              <h2 id="today-title">Aujourd’hui</h2>
            </div>
            <div className="home__cards">
              {tasks.length === 0 && (
                <div className="home__empty">
                  <span>—</span>
                  Aucune tâche planifiée pour aujourd’hui.
                </div>
              )}
              {tasks.map((task, index) => (
                <Card
                  key={`${task.title}-${index}`}
                  eyebrow={`${task.category}${task.difficulty ? ` / ${task.difficulty}` : ''}`}
                  meta={`T-${String(index + 1).padStart(2, '0')}`}
                  title={task.title}
                  actions={
                    <>
                      <Button
                        className="task-card__action"
                        type="button"
                        variant="secondary"
                        onClick={() => openEditTaskModal(index)}
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
                    </>
                  }
                >
                  {task.mission}
                </Card>
              ))}
            </div>
          </section>
          <section className="home__section" aria-labelledby="success-title">
            <div className="home__section-heading">
              <p className="home__section-eyebrow">02 / PROGRESSION</p>
              <h2 id="success-title">Succès proches de la réalisation</h2>
            </div>
            <Achievements tasks={tasks} preview />
          </section>
        </HomeLayout>
      </main>
      <TaskModal
        isOpen={isModalOpen}
        task={editingTaskIndex === null ? undefined : tasks[editingTaskIndex]}
        taskIndex={editingTaskIndex === null ? undefined : editingTaskIndex}
        onClose={() => setIsModalOpen(false)}
      />
      <Footer />
    </>
  )
}

export default Home