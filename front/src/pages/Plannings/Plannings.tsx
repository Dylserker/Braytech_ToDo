import { useState } from 'react'
import Button from '../../components/Buttons/Buttons'
import Header from '../../components/Header/Header'
import Tab from '../../components/Tabs/Tab'
import PlanningLayout from '../../layouts/PlanningLayout/PlanningLayout'
import './Plannings.css'

type CalendarView = 'jour' | 'semaine' | 'mois' | 'année'

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

function getMonday(date: Date) {
  const monday = new Date(date)
  const day = monday.getDay()
  monday.setDate(monday.getDate() - (day === 0 ? 6 : day - 1))
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

function Plannings() {
  const [calendarView, setCalendarView] = useState<CalendarView>('semaine')
  const [selectedDate, setSelectedDate] = useState(() => new Date())

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

  const renderCalendar = () => {
    if (calendarView === 'jour') {
      return (
        <div className="calendar calendar--day">
          {Array.from({ length: 24 }, (_, hour) => (
            <div className="calendar__hour" key={hour}>
              <span>{String(hour).padStart(2, '0')}:00</span>
              <div />
            </div>
          ))}
        </div>
      )
    }

    if (calendarView === 'semaine') {
      const monday = getMonday(selectedDate)
      return (
        <div className="calendar calendar--week">
          <div className="calendar__week-header">
            {WEEK_DAYS.map((day, index) => {
              const date = new Date(monday)
              date.setDate(monday.getDate() + index)
              return (
                <div key={day}>
                  <span>{day}</span>
                  <strong>{date.getDate()}</strong>
                </div>
              )
            })}
          </div>
          <div className="calendar__week-body">
            {Array.from({ length: 84 }, (_, slot) => (
              <div key={slot} />
            ))}
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
                {day && <span>{day}</span>}
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
          </div>
        ))}
      </div>
    )
  }

  return (
    <>
      <Header />
      <main className="planning">
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
              <Button type="button" onClick={() => window.location.assign('/#new-task')}>
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
            {renderCalendar()}
          </section>
        </PlanningLayout>
      </main>
    </>
  )
}

export default Plannings