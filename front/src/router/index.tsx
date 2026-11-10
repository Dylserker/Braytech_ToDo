import { createBrowserRouter } from 'react-router'
import Home from '../pages/Home/Home'
import Plannings from '../pages/Plannings/Plannings'
import Contact from '../pages/Contact/Contact'
import Achievements from '../pages/Achievements/Achievements'
import Login from '../pages/Login/Login'
import Register from '../pages/Register/Register'
import Profile from '../pages/Profile/Profile'
import Settings from '../pages/Settings/Settings'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />,
  },
  {
    path: '/planning',
    element: <Plannings />,
  },
  {
    path: '/contact',
    element: <Contact />,
  },
  {
    path: '/achievements',
    element: <Achievements />,
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
    element: <Profile />,
  },
  {
    path: '/settings',
    element: <Settings />,
  },
])