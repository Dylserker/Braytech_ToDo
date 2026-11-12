import { useEffect, useState, type ReactNode } from 'react'
import { Navigate } from 'react-router'

const sessionUrl = 'https://localhost:3000/api/v1/auth/bungie/session'

type ProtectedRouteProps = {
  children: ReactNode
}

function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [isCheckingSession, setIsCheckingSession] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    fetch(sessionUrl, { credentials: 'include' })
      .then((response) => {
        setIsAuthenticated(response.ok)
      })
      .catch(() => {
        setIsAuthenticated(false)
      })
      .finally(() => {
        setIsCheckingSession(false)
      })
  }, [])

  if (isCheckingSession) return null
  if (!isAuthenticated) return <Navigate to="/login" replace />

  return children
}

export default ProtectedRoute
