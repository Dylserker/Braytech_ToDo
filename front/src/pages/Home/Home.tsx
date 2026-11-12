import { useMemo, useState } from 'react'
import Button from '../../components/Buttons/Buttons'
import Card from '../../components/Cards/Cards'
import Achievements from '../../components/Achievements/Achievements'
import Header from '../../components/Header/Header'
import Footer from '../../components/Footer/Footer'
import TaskModal from '../../components/TaskModal/TaskModal'
import { useTasks } from '../../context/TaskContext'
import './Home.css'

function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { tasks, removeTask } = useTasks()
  const [editingTaskIndex, setEditingTaskIndex] = useState<number | null>(null)
  const [activeFilter, setActiveFilter] = useState('Toutes')

  const openNewTaskModal = () => {
    setEditingTaskIndex(null)
    setIsModalOpen(true)
  }

  const openEditTaskModal = (index: number) => {
    setEditingTaskIndex(index)
    setIsModalOpen(true)
  }

  const filters = ['Toutes', 'À faire', ...new Set(tasks.map((task) => task.category))]
  const visibleTasks = useMemo(
    () => activeFilter === 'Toutes' || activeFilter === 'À faire'
      ? tasks
      : tasks.filter((task) => task.category === activeFilter),
    [activeFilter, tasks],
  )

  return (
    <>
      <Header />
      <main className="home">
        <div className="home__shell">
          <aside className="home__sidebar" aria-label="Résumé du compte">
            <p className="home__eyebrow">BRAYTECH / 01</p>
            <div className="home__status"><span /> Synchronisation active</div>
            <div className="home__sidebar-rule" />
            <p className="home__sidebar-label">VOTRE SESSION</p>
            <strong className="home__guardian">Gardien Braytech</strong>
            <p className="home__sidebar-copy">Les tâches restent en attente jusqu’à ce qu’une activité vérifiable soit détectée.</p>
            <div className="home__sync"><span>Dernière synchronisation</span><strong>Jamais</strong><small>Connectez Bungie pour commencer</small></div>
            <a className="home__sidebar-link" href="/settings">Paramètres <span>↗</span></a>
          </aside>
          <div className="home__content">
            <div className="home__heading">
              <div><p className="home__kicker">TABLEAU DE PLANIFICATION</p><h1>Vos activités,<br /><em>sans le bruit.</em></h1><p className="home__intro">Préparez votre prochaine session. La preuve de progression vient de Bungie, automatiquement.</p></div>
              <Button type="button" onClick={openNewTaskModal}><span aria-hidden="true">+</span> Nouvelle tâche</Button>
            </div>
            <div className="home__metrics" aria-label="Résumé des tâches">
              <div><span>Total planifié</span><strong>{tasks.length}</strong></div><div><span>À faire</span><strong>{tasks.length}</strong></div><div><span>Validées automatiquement</span><strong>0</strong></div><div className="home__metrics-sync"><span>État Bungie</span><strong><i /> En attente de connexion</strong></div>
            </div>
            <section className="home__section" aria-labelledby="tasks-title">
              <div className="home__section-heading"><div><p className="home__section-eyebrow">01 / OBJECTIFS</p><h2 id="tasks-title">À accomplir</h2></div><span className="home__task-count">{visibleTasks.length} entrée{visibleTasks.length === 1 ? '' : 's'}</span></div>
              <div className="home__filters" role="group" aria-label="Filtrer les tâches">{filters.map((filter) => <button key={filter} className={activeFilter === filter ? 'is-active' : ''} type="button" onClick={() => setActiveFilter(filter)}>{filter}</button>)}</div>
              <div className="home__cards">
                {visibleTasks.length === 0 && <div className="home__empty"><div className="home__empty-mark">+</div><div><strong>Votre plan est vide.</strong><p>Ajoutez une activité pour préparer votre prochaine session.</p></div><Button type="button" variant="secondary" onClick={openNewTaskModal}>Créer une tâche</Button></div>}
                {visibleTasks.map((task) => { const index = tasks.indexOf(task); return <Card key={`${task.title}-${index}`} eyebrow={`${task.category}${task.difficulty ? ` · ${task.difficulty}` : ''}`} meta={`T-${String(index + 1).padStart(2, '0')}`} title={task.title} actions={<><Button className="task-card__action" type="button" variant="secondary" onClick={() => openEditTaskModal(index)}>Modifier</Button><Button className="task-card__action" type="button" variant="danger" onClick={() => removeTask(index)}>Supprimer</Button></>}><span>{task.mission}</span><span className="task-card__proof"><i /> En attente d’une preuve Bungie</span></Card> })}
              </div>
            </section>
            <section className="home__section home__section--secondary" aria-labelledby="success-title"><div className="home__section-heading"><div><p className="home__section-eyebrow">02 / PROGRESSION</p><h2 id="success-title">Succès proches</h2></div><a href="/achievements">Voir tout ↗</a></div><Achievements tasks={tasks} preview /></section>
          </div>
        </div>
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