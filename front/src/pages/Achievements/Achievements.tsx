import AchievementsTable from '../../components/Achievements/Achievements'
import Footer from '../../components/Footer/Footer'
import Header from '../../components/Header/Header'
import { useTasks } from '../../context/TaskContext'
import './Achievements.css'

function Achievements() {
  const { tasks } = useTasks()

  return (
    <div className="achievements-page">
      <Header />
      <main className="achievements-page__main">
        <p className="achievements-page__eyebrow">BRAYTECH / PROGRESSION</p>
        <div className="achievements-page__heading">
          <div>
            <h1>Vos succès</h1>
            <p>Suivez les objectifs accomplis au fil de vos missions.</p>
          </div>
          <span>ARCHIVE BT-02 / ACTIVE</span>
        </div>
        <section aria-labelledby="achievements-title">
          <div className="achievements-page__section-heading">
            <p>01 / TABLEAU DES SUCCÈS</p>
            <h2 id="achievements-title">Progression générale</h2>
          </div>
          <AchievementsTable tasks={tasks} />
        </section>
      </main>
      <Footer />
    </div>
  )
}

export default Achievements
