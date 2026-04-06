import { Navigate, useLocation } from 'react-router-dom'
import { useAuth, canAccess, type Role } from '../context/AuthContext'

const DEFAULT_BY_ROLE: Record<Role, string> = {
  admin: '/dashboard',
  inversionista: '/mi-panel',
  empresario: '/mi-panel',
}

interface ProtectedRouteProps {
  children: React.ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { role } = useAuth()
  const location = useLocation()
  const currentPath = location.pathname

  if (canAccess(role, currentPath)) {
    return <>{children}</>
  }

  return <Navigate to={DEFAULT_BY_ROLE[role]} replace state={{ from: currentPath }} />
}
