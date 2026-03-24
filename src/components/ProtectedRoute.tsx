import { Navigate, useLocation } from 'react-router-dom'
import { useAuth, canAccess, type Role } from '../context/AuthContext'

/** Ruta por defecto según el rol cuando no tiene acceso */
const DEFAULT_BY_ROLE: Record<Role, string> = {
  superadmin: '/dashboard',
  administrador: '/dashboard',
  inversionista: '/inversionistas/panel',
  empresario: '/empresarios/panel',
}

interface ProtectedRouteProps {
  children: React.ReactNode
}

/**
 * Protege una ruta según el rol del usuario.
 * Si no tiene acceso, redirige a la ruta por defecto de su rol.
 */
export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { role } = useAuth()
  const location = useLocation()
  const currentPath = location.pathname

  if (canAccess(role, currentPath)) {
    return <>{children}</>
  }

  const redirectTo = DEFAULT_BY_ROLE[role]
  return <Navigate to={redirectTo} replace state={{ from: currentPath }} />
}
