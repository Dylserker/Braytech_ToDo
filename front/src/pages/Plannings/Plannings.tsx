import { useState } from 'react'
import Button from '../../components/Buttons/Buttons'
import Header from '../../components/Header/Header'
import Footer from '../../components/Footer/Footer'
import Modal from '../../components/Modals/Modal'
import Tab from '../../components/Tabs/Tab'
import TaskModal from '../../components/TaskModal/TaskModal'
import { useTasks } from '../../context/TaskContext'
import PlanningLayout from '../../layouts/PlanningLayout/PlanningLayout'
import type { Task } from '../../types/task'
import './Plannings.css'

type CalendarView = 'jour' | 'semaine' | 'mois' | 'année'

type PlacedTask = {
  task: Task
  taskIndex: number
  startMinutes: number
  endMinutes: number
  top: number
  height: number
  col: number
  totalCols: number
  colSpan: number
  startTimeFormatted: string
  endTimeFormatted: string
}

const WEEK_DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
const MONTHS = [
  'Janvier',
  'Février',
  'Mars',
  'Avril',
  'Mai',
  'Juin',
  'Juillet',
  'Août',
  'Septembre',
  'Octobre',
  'Novembre',
  'Décembre',
]

const HOURS = Array.from({ length: 24 }, (_, i) => i)
const HOUR_HEIGHT = 48

function getMonday(date: Date) {
  const monday = new Date(date)
  const day = monday.getDay()
  monday.setDate(monday.getDate() - (day === 0 ? 6 : day - 1))
  monday.setHours(0, 0, 0, 0)
  return monday
}

function getMonthDays(date: Date) {
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1)
  const offset = (firstDay.getDay() + 6) % 7
  const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  return Array.from({ length: offset + daysInMonth }, (_, index) =>
    index < offset ? null : index - offset + 1,
  )
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

function formatMinutes(minutes: number) {
  const h = Math.floor(minutes / 60)
  const m = Math.floor(minutes % 60)
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

function formatFullSchedule(createdAt: string, endsAt?: string | null) {
  const start = new Date(createdAt)
  const pad = (n: number) => String(n).padStart(2, '0')
  const startDateStr = new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(start)
  const startTimeStr = `${pad(start.getHours())}:${pad(start.getMinutes())}`

  if (!endsAt) {
    return `${startDateStr} à ${startTimeStr}`
  }

  const end = new Date(endsAt)
  const endDateStr = new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(end)
  const endTimeStr = `${pad(end.getHours())}:${pad(end.getMinutes())}`

  if (startDateStr === endDateStr) {
    return `${startDateStr} de ${startTimeStr} à ${endTimeStr}`
  }
  return `Du ${startDateStr} à ${startTimeStr} au ${endDateStr} à ${endTimeStr}`
}

function getPlacedTasksForDay(allTasks: Task[], dayDate: Date, hourHeight: number): PlacedTask[] {
  const dayStart = new Date(dayDate.getFullYear(), dayDate.getMonth(), dayDate.getDate(), 0, 0, 0, 0)
  const dayEnd = new Date(dayDate.getFullYear(), dayDate.getMonth(), dayDate.getDate(), 23, 59, 59, 999)

  const dayItems: Array<{
    task: Task
    taskIndex: number
    startMinutes: number
    endMinutes: number
    top: number
    height: number
  }> = []

  allTasks.forEach((task, index) => {
    const taskStart = new Date(task.createdAt)
    if (isNaN(taskStart.getTime())) return

    let taskEnd = task.endsAt ? new Date(task.endsAt) : new Date(taskStart.getTime() + 60 * 60 * 1000)
    if (isNaN(taskEnd.getTime()) || taskEnd <= taskStart) {
      taskEnd = new Date(taskStart.getTime() + 60 * 60 * 1000)
    }

    if (taskStart <= dayEnd && taskEnd >= dayStart) {
      const effectiveStart = Math.max(taskStart.getTime(), dayStart.getTime())
      const effectiveEnd = Math.min(taskEnd.getTime(), dayEnd.getTime())

      let startMinutes = (effectiveStart - dayStart.getTime()) / (60 * 1000)
      let endMinutes = (effectiveEnd - dayStart.getTime()) / (60 * 1000)

      startMinutes = Math.max(0, Math.min(1440, startMinutes))
      endMinutes = Math.max(0, Math.min(1440, endMinutes))

      if (endMinutes <= startMinutes) {
        endMinutes = Math.min(1440, startMinutes + 30)
      }

      const durationMinutes = endMinutes - startMinutes
      const top = (startMinutes / 60) * hourHeight
      const height = Math.max(26, (durationMinutes / 60) * hourHeight)

      dayItems.push({
        task,
        taskIndex: index,
        startMinutes,
        endMinutes,
        top,
        height,
      })
    }
  })

  dayItems.sort((a, b) => {
    if (a.startMinutes !== b.startMinutes) return a.startMinutes - b.startMinutes
    return (b.endMinutes - b.startMinutes) - (a.endMinutes - a.startMinutes)
  })

  const clusters: Array<typeof dayItems> = []
  let currentCluster: typeof dayItems = []
  let currentClusterEnd = -1

  for (const item of dayItems) {
    if (currentCluster.length === 0 || item.startMinutes < currentClusterEnd) {
      currentCluster.push(item)
      currentClusterEnd = Math.max(currentClusterEnd, item.endMinutes)
    } else {
      clusters.push(currentCluster)
      currentCluster = [item]
      currentClusterEnd = item.endMinutes
    }
  }
  if (currentCluster.length > 0) {
    clusters.push(currentCluster)
  }

  const result: PlacedTask[] = []

  for (const cluster of clusters) {
    const columns: Array<Array<{ startMinutes: number; endMinutes: number }>> = []
    const clusterPlaced: Array<typeof dayItems[0] & { col: number }> = []

    for (const item of cluster) {
      let assignedCol = -1
      for (let c = 0; c < columns.length; c++) {
        const lastInCol = columns[c][columns[c].length - 1]
        if (lastInCol.endMinutes <= item.startMinutes) {
          assignedCol = c
          columns[c].push(item)
          break
        }
      }
      if (assignedCol === -1) {
        assignedCol = columns.length
        columns.push([item])
      }
      clusterPlaced.push({
        ...item,
        col: assignedCol,
      })
    }

    const totalCols = columns.length

    for (const placed of clusterPlaced) {
      let colSpan = 1
      for (let c = placed.col + 1; c < totalCols; c++) {
        const collides = columns[c].some(
          (other) => other.startMinutes < placed.endMinutes && placed.startMinutes < other.endMinutes,
        )
        if (collides) break
        colSpan++
      }

      result.push({
        ...placed,
        totalCols,
        colSpan,
        startTimeFormatted: formatMinutes(placed.startMinutes),
        endTimeFormatted: formatMinutes(placed.endMinutes),
      })
    }
  }

  return result
}

function Plannings() {
  const [today] = useState(() => new Date())
  const [calendarView, setCalendarView] = useState<CalendarView>('semaine')
  const [selectedDate, setSelectedDate] = useState(() => new Date())
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTaskIndex, setEditingTaskIndex] = useState<number | null>(null)
  const [selectedTaskIndex, setSelectedTaskIndex] = useState<number | null>(null)
  const { tasks, removeTask } = useTasks()

  const moveDate = (direction: -1 | 1) => {
    const nextDate = new Date(selectedDate)
    if (calendarView === 'jour') nextDate.setDate(nextDate.getDate() + direction)
    if (calendarView === 'semaine') nextDate.setDate(nextDate.getDate() + direction * 7)
    if (calendarView === 'mois') nextDate.setMonth(nextDate.getMonth() + direction)
    if (calendarView === 'année') nextDate.setFullYear(nextDate.getFullYear() + direction)
    setSelectedDate(nextDate)
  }

  const periodLabel = new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(selectedDate)

  const renderNowIndicator = () => {
    const minutes = today.getHours() * 60 + today.getMinutes()
    const top = (minutes / 60) * HOUR_HEIGHT
    return (
      <div className="calendar__now-indicator" style={{ top: `${top}px` }}>
        <div className="calendar__now-dot" />
        <div className="calendar__now-line" />
      </div>
    )
  }

  const renderPlacedTask = (placed: PlacedTask) => {
    const isSingleCol = placed.totalCols === 1
    return (
      <button
        className="calendar-task"
        key={`${placed.task.id ?? placed.task.title}-${placed.task.createdAt}-${placed.taskIndex}`}
        type="button"
        style={{
          top: `${placed.top}px`,
          height: `${placed.height}px`,
          left: `calc(${(placed.col * 100) / placed.totalCols}% + 2px)`,
          width: `calc(${(placed.colSpan * 100) / placed.totalCols}% - 4px)`,
        }}
        title={`${placed.task.title} (${placed.startTimeFormatted} — ${placed.endTimeFormatted})\n${placed.task.category} · ${placed.task.mission}`}
        onClick={() => setSelectedTaskIndex(placed.taskIndex)}
      >
        <span className="calendar-task__time">
          {placed.startTimeFormatted} — {placed.endTimeFormatted}
        </span>
        <strong className="calendar-task__title">{placed.task.title}</strong>
        {(isSingleCol || placed.height >= 52) && (
          <span className="calendar-task__meta">{placed.task.category}</span>
        )}
      </button>
    )
  }

  const renderDayColumn = (date: Date, key: number | string) => {
    const placed = getPlacedTasksForDay(tasks, date, HOUR_HEIGHT)
    const isToday = isSameDay(date, today)

    return (
      <div className={`calendar__day-column ${isToday ? 'is-today' : ''}`} key={key}>
        <div className="calendar__grid-lines">
          {HOURS.map((hour) => (
            <div className="calendar__grid-line" key={hour} />
          ))}
        </div>
        {isToday && renderNowIndicator()}
        <div className="calendar__events-layer">
          {placed.map((item) => renderPlacedTask(item))}
        </div>
      </div>
    )
  }

  const renderCalendar = () => {
    if (calendarView === 'jour') {
      const isToday = isSameDay(selectedDate, today)
      const dayIndex = (selectedDate.getDay() + 6) % 7
      return (
        <div className="calendar calendar--day">
          <div className="calendar__day-view-header">
            <div className="calendar__gutter-spacer" />
            <div className={`calendar__day-header-cell ${isToday ? 'is-today' : ''}`}>
              <span>{WEEK_DAYS[dayIndex]}</span>
              <strong>
                {selectedDate.getDate()} {MONTHS[selectedDate.getMonth()]} {selectedDate.getFullYear()}
              </strong>
            </div>
          </div>
          <div className="calendar__day-view-body">
            <div className="calendar__time-gutter">
              {HOURS.map((hour) => (
                <div className="calendar__time-slot" key={hour}>
                  <span>{String(hour).padStart(2, '0')}:00</span>
                </div>
              ))}
            </div>
            <div className="calendar__single-column-wrapper">
              {renderDayColumn(selectedDate, 'single-day')}
            </div>
          </div>
        </div>
      )
    }

    if (calendarView === 'semaine') {
      const monday = getMonday(selectedDate)
      return (
        <div className="calendar calendar--week">
          <div className="calendar__week-view-header">
            <div className="calendar__gutter-spacer" />
            <div className="calendar__week-days-header">
              {WEEK_DAYS.map((day, index) => {
                const date = new Date(monday)
                date.setDate(monday.getDate() + index)
                const isToday = isSameDay(date, today)
                return (
                  <div className={`calendar__day-header-cell ${isToday ? 'is-today' : ''}`} key={day}>
                    <span>{day}</span>
                    <strong>{date.getDate()}</strong>
                  </div>
                )
              })}
            </div>
          </div>
          <div className="calendar__week-view-body">
            <div className="calendar__time-gutter">
              {HOURS.map((hour) => (
                <div className="calendar__time-slot" key={hour}>
                  <span>{String(hour).padStart(2, '0')}:00</span>
                </div>
              ))}
            </div>
            <div className="calendar__week-columns-wrapper">
              {Array.from({ length: 7 }, (_, dayIndex) => {
                const date = new Date(monday)
                date.setDate(monday.getDate() + dayIndex)
                return renderDayColumn(date, dayIndex)
              })}
            </div>
          </div>
        </div>
      )
    }

    if (calendarView === 'mois') {
      return (
        <div className="calendar calendar--month">
          <div className="calendar__month-header">
            {WEEK_DAYS.map((day) => <span key={day}>{day}</span>)}
          </div>
          <div className="calendar__month-grid">
            {getMonthDays(selectedDate).map((day, index) => (
              <div className="calendar__month-day" key={`${day}-${index}`}>
                {day && (
                  <>
                    <span>{day}</span>
                    {(() => {
                      const dayStart = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day, 0, 0, 0)
                      const dayEnd = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day, 23, 59, 59)
                      const taskCount = tasks.filter((task) => {
                        const taskStart = new Date(task.createdAt)
                        if (isNaN(taskStart.getTime())) return false
                        let taskEnd = task.endsAt ? new Date(task.endsAt) : new Date(taskStart.getTime() + 60 * 60 * 1000)
                        if (isNaN(taskEnd.getTime()) || taskEnd <= taskStart) {
                          taskEnd = new Date(taskStart.getTime() + 60 * 60 * 1000)
                        }
                        return taskStart <= dayEnd && taskEnd >= dayStart
                      }).length

                      return taskCount > 0 ? (
                        <button
                          className="calendar-count"
                          type="button"
                          onClick={() => {
                            setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day))
                            setCalendarView('jour')
                          }}
                        >
                          {taskCount} tâche{taskCount > 1 ? 's' : ''}
                        </button>
                      ) : null
                    })()}
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )
    }

    return (
      <div className="calendar calendar--year">
        {MONTHS.map((month, index) => (
          <div className="calendar__year-month" key={month}>
            <span>{String(index + 1).padStart(2, '0')}</span>
            <strong>{month}</strong>
            <small>{selectedDate.getFullYear()}</small>
            {(() => {
              const monthStart = new Date(selectedDate.getFullYear(), index, 1, 0, 0, 0)
              const monthEnd = new Date(selectedDate.getFullYear(), index + 1, 0, 23, 59, 59)
              const taskCount = tasks.filter((task) => {
                const taskStart = new Date(task.createdAt)
                if (isNaN(taskStart.getTime())) return false
                let taskEnd = task.endsAt ? new Date(task.endsAt) : new Date(taskStart.getTime() + 60 * 60 * 1000)
                if (isNaN(taskEnd.getTime()) || taskEnd <= taskStart) {
                  taskEnd = new Date(taskStart.getTime() + 60 * 60 * 1000)
                }
                return taskStart <= monthEnd && taskEnd >= monthStart
              }).length

              return taskCount > 0 ? (
                <button
                  className="calendar-count"
                  type="button"
                  onClick={() => {
                    setSelectedDate(new Date(selectedDate.getFullYear(), index, 1))
                    setCalendarView('mois')
                  }}
                >
                  {taskCount} tâche{taskCount > 1 ? 's' : ''}
                </button>
              ) : null
            })()}
          </div>
        ))}
      </div>
    )
  }

  return (
    <>
      <Header />
      <main className={`planning${calendarView === 'jour' ? ' planning--day' : ''}`}>
        <p className="planning__eyebrow">BRAYTECH / PLANNING</p>
        <h1>Votre planning</h1>
        <p className="planning__intro">Organisez vos prochaines missions avec précision.</p>
        <PlanningLayout>
          <section className="planning-panel" aria-label="Navigation du planning">
            <div className="planning-panel__topline">
              <div>
                <p className="planning-panel__eyebrow">BRAYTECH EXOSCIENCE / TIMELINE</p>
                <strong>{periodLabel}</strong>
              </div>
              <Button type="button" onClick={() => {
                setEditingTaskIndex(null)
                setIsModalOpen(true)
              }}>
                + Nouvelle tâche
              </Button>
            </div>
            <div className="planning-panel__controls">
              <div className="planning-panel__tabs" role="tablist" aria-label="Période du planning">
                {(['jour', 'semaine', 'mois', 'année'] as CalendarView[]).map((view) => (
                  <Tab
                    key={view}
                    active={calendarView === view}
                    aria-selected={calendarView === view}
                    role="tab"
                    onClick={() => setCalendarView(view)}
                  >
                    {view}
                  </Tab>
                ))}
              </div>
              <div className="planning-panel__navigation">
                <Button variant="secondary" aria-label="Période précédente" onClick={() => moveDate(-1)}>
                  ←
                </Button>
                <Button variant="secondary" onClick={() => setSelectedDate(new Date())}>
                  Aujourd'hui
                </Button>
                <Button variant="secondary" aria-label="Période suivante" onClick={() => moveDate(1)}>
                  →
                </Button>
              </div>
            </div>
          </section>
          <section className="calendar-view" aria-label={`Vue ${calendarView}`}>
            <div className="calendar-view__label">
              <span>UNITÉ TEMPORELLE</span>
              <strong>
                {calendarView === 'jour'
                  ? '24 heures'
                  : calendarView === 'semaine'
                    ? 'Lundi — Dimanche'
                    : calendarView === 'mois'
                      ? MONTHS[selectedDate.getMonth()]
                      : `Année ${selectedDate.getFullYear()}`}
              </strong>
            </div>
            <div className="calendar-view__container">
              {renderCalendar()}
            </div>
          </section>
        </PlanningLayout>
      </main>
      <Modal
        eyebrow="Interaction détectée"
        isOpen={selectedTaskIndex !== null}
        title="Gérer la tâche"
        onClose={() => setSelectedTaskIndex(null)}
      >
        {selectedTaskIndex !== null && tasks[selectedTaskIndex] && (
          <div className="task-actions-modal">
            <p className="task-actions-modal__task">{tasks[selectedTaskIndex].title}</p>
            <p className="task-actions-modal__meta">
              {tasks[selectedTaskIndex].category} / {tasks[selectedTaskIndex].mission}
              {tasks[selectedTaskIndex].difficulty ? ` · ${tasks[selectedTaskIndex].difficulty}` : ''}
            </p>
            <p className="task-actions-modal__schedule">
              <strong>Horaire : </strong>
              {formatFullSchedule(tasks[selectedTaskIndex].createdAt, tasks[selectedTaskIndex].endsAt)}
            </p>
            {tasks[selectedTaskIndex].description && (
              <p className="task-actions-modal__description">{tasks[selectedTaskIndex].description}</p>
            )}
            <div className="task-form__actions">
              <Button
                type="button"
                variant="danger"
                onClick={() => {
                  removeTask(selectedTaskIndex)
                  setSelectedTaskIndex(null)
                }}
              >
                Supprimer
              </Button>
              <Button
                type="button"
                onClick={() => {
                  setEditingTaskIndex(selectedTaskIndex)
                  setSelectedTaskIndex(null)
                  setIsModalOpen(true)
                }}
              >
                Modifier
              </Button>
            </div>
          </div>
        )}
      </Modal>
      <TaskModal
        defaultDate={selectedDate}
        isOpen={isModalOpen}
        task={editingTaskIndex === null ? undefined : tasks[editingTaskIndex]}
        taskIndex={editingTaskIndex === null ? undefined : editingTaskIndex}
        onClose={() => setIsModalOpen(false)}
      />
      <Footer />
    </>
  )
}

export default Plannings
