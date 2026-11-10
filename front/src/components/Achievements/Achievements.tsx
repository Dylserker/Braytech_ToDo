import { useState } from 'react'
import type { Task } from '../../types/task'
import Tab from '../Tabs/Tab'
import './Achievements.css'

type AchievementTheme = 'general' | 'raid' | 'osiris'

type Achievement = {
  title: string
  description: string
  target: number
  progress: number
  theme: AchievementTheme
}

type AchievementsProps = {
  tasks: Task[]
  preview?: boolean
}

function Achievements({ tasks, preview = false }: AchievementsProps) {
  const [theme, setTheme] = useState<AchievementTheme>('general')
  const raidTasks = tasks.filter((task) => task.category === 'Raid')
  const osirisTasks = tasks.filter(
    (task) => task.category === 'Épreuves' && task.mission === 'Épreuves d’Osiris',
  )
  const achievementsByTheme: Record<AchievementTheme, Achievement[]> = {
    general: [
      {
        title: 'Votre première tâche',
        description: 'Ajouter une mission au centre de contrôle',
        target: 1,
        progress: tasks.length,
        theme: 'general',
      },
      {
        title: 'Accomplir 3 missions',
        description: 'Répertorier trois missions dans votre planning',
        target: 3,
        progress: tasks.length,
        theme: 'general',
      },
      {
        title: 'Maître de la diversité',
        description: 'Explorer trois catégories différentes',
        target: 3,
        progress: new Set(tasks.map((task) => task.category)).size,
        theme: 'general',
      },
    ],
    raid: [
      {
        title: 'Premier raid',
        description: 'Ajouter une activité de raid à votre planning',
        target: 1,
        progress: raidTasks.length,
        theme: 'raid',
      },
      {
        title: 'Escouade formée',
        description: 'Planifier 3 activités de raid',
        target: 3,
        progress: raidTasks.length,
        theme: 'raid',
      },
    ],
    osiris: [
      {
        title: 'Entrer dans l’arène',
        description: 'Ajouter une activité d’Osiris',
        target: 1,
        progress: osirisTasks.length,
        theme: 'osiris',
      },
      {
        title: 'Flawless en préparation',
        description: 'Planifier 3 activités d’Osiris',
        target: 3,
        progress: osirisTasks.length,
        theme: 'osiris',
      },
    ],
  }
  const achievements = preview
    ? Object.values(achievementsByTheme)
        .flat()
        .sort((first, second) => second.progress / second.target - first.progress / first.target)
        .slice(0, 4)
    : achievementsByTheme[theme]

  return (
    <div className={`achievements${preview ? ' achievements--preview' : ''}`}>
      {!preview && (
        <div className="achievements__themes" role="tablist" aria-label="Thème des succès">
          <Tab active={theme === 'general'} onClick={() => setTheme('general')} role="tab" aria-selected={theme === 'general'}>
            Général
          </Tab>
          <Tab active={theme === 'raid'} onClick={() => setTheme('raid')} role="tab" aria-selected={theme === 'raid'}>
            Raid
          </Tab>
          <Tab active={theme === 'osiris'} onClick={() => setTheme('osiris')} role="tab" aria-selected={theme === 'osiris'}>
            Osiris
          </Tab>
        </div>
      )}
      <table className="achievements__table">
        <caption className="sr-only">Progression des succès</caption>
        <thead>
          <tr>
            <th scope="col">Succès</th>
            <th scope="col">Progression</th>
            <th scope="col">État</th>
          </tr>
        </thead>
        <tbody>
          {achievements.map((achievement) => {
            const progress = Math.min(achievement.progress, achievement.target)
            const percentage = Math.round((progress / achievement.target) * 100)
            const isComplete = progress >= achievement.target

            return (
              <tr key={achievement.title}>
                <th scope="row">
                  <strong>{achievement.title}</strong>
                  <span>{achievement.description}</span>
                </th>
                <td>
                  <div className="achievement-progress">
                    <div className="achievement-progress__bar">
                      <span style={{ width: `${percentage}%` }} />
                    </div>
                    <small>
                      {progress} / {achievement.target}
                    </small>
                  </div>
                </td>
                <td>
                  <span className={`achievement-status${isComplete ? ' achievement-status--complete' : ''}`}>
                    {isComplete ? 'Déverrouillé' : `${percentage}%`}
                  </span>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default Achievements
