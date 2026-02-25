import { Navigate } from 'react-router-dom'
import { useAuth, type Role } from '../context/AuthContext'

/** Ruta inicial según el rol del usuario */
const HOME_BY_ROLE: Record<Role, string> = {
  superadmin: '/dashboard',
  administrador: '/dashboard',
  inversionista: '/avance-semana',
  empresario: '/avance-semana',
}

/**
 * Redirige desde "/" a la ruta de inicio según el rol del usuario.
 */
export default function RoleAwareRedirect() {
  const { role } = useAuth()
  const to = HOME_BY_ROLE[role]
  return <Navigate to={to} replace /> 
}
