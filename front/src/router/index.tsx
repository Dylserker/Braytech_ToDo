import { createBrowserRouter } from 'react-router'
import Home from '../pages/Home/Home'
import Plannings from '../pages/Plannings/Plannings'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />,
  },
  {
    path: '/planning',
    element: <Plannings />,
  }
])