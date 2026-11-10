import { RouterProvider } from 'react-router'
import { TaskProvider } from './context/TaskContext'
import { router } from './router/index'

function App() {

  return <TaskProvider><RouterProvider router={router} /></TaskProvider>
}

export default App