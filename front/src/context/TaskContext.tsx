import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Task } from '../types/task'

type TaskContextValue = {
  tasks: Task[]
  addTask: (task: Task) => void
  updateTask: (index: number, task: Task) => void
  removeTask: (index: number) => void
}

const TaskContext = createContext<TaskContextValue | null>(null)

export function TaskProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>(() => {
    const storedTasks = localStorage.getItem('braytech-tasks')
    if (!storedTasks) return []
    try {
      return JSON.parse(storedTasks) as Task[]
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem('braytech-tasks', JSON.stringify(tasks))
  }, [tasks])

  const value = useMemo(
    () => ({
      tasks,
      addTask: (task: Task) => setTasks((current) => [...current, task]),
      updateTask: (index: number, task: Task) =>
        setTasks((current) => current.map((item, itemIndex) => itemIndex === index ? task : item)),
      removeTask: (index: number) =>
        setTasks((current) => current.filter((_, itemIndex) => itemIndex !== index)),
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
