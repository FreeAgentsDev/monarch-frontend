import { Navigate } from 'react-router-dom'
import { useAuth, type Role } from '../context/AuthContext'

const HOME_BY_ROLE: Record<Role, string> = {
  admin: '/dashboard',
  inversionista: '/mi-panel',
  empresario: '/mi-panel',
}

export default function RoleAwareRedirect() {
  const { role } = useAuth()
  return <Navigate to={HOME_BY_ROLE[role]} replace />
}
