import { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

interface RequireAuthProps {
  children: ReactNode
}

/** Redirige a /login si no hay usuario autenticado */
export default function RequireAuth({ children }: RequireAuthProps) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}
