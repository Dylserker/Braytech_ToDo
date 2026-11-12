import type { ReactNode } from 'react'
import { createBrowserRouter } from 'react-router'
import Home from '../pages/Home/Home'
import Plannings from '../pages/Plannings/Plannings'
import Contact from '../pages/Contact/Contact'
import Achievements from '../pages/Achievements/Achievements'
import Login from '../pages/Login/Login'
import Register from '../pages/Register/Register'
import Profile from '../pages/Profile/Profile'
import Settings from '../pages/Settings/Settings'
import ProtectedRoute from './ProtectedRoute'

const protectedElement = (element: ReactNode) => (
  <ProtectedRoute>{element}</ProtectedRoute>
)

export const router = createBrowserRouter([
  {
    path: '/',
    element: protectedElement(<Home />),
  },
  {
    path: '/planning',
    element: protectedElement(<Plannings />),
  },
  {
    path: '/contact',
    element: protectedElement(<Contact />),
  },
  {
    path: '/achievements',
    element: protectedElement(<Achievements />),
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/register',
    element: <Register />,
  },
  {
    path: '/profile',
    element: protectedElement(<Profile />),
  },
  {
    path: '/settings',
    element: protectedElement(<Settings />),
  },
])