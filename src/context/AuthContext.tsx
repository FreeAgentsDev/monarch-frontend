import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

export type Role = 'superadmin' | 'administrador' | 'inversionista' | 'empresario'

export interface User {
  id: string
  name: string
  email: string
  role: Role
  paisCodigo?: string
}

interface AuthContextValue {
  user: User | null
  role: Role
  setUser: (u: User | null) => void
  setRole: (r: Role) => void
  logout: () => void
}

const defaultUser: User = {
  id: '1',
  name: 'Admin',
  email: 'admin@monarch.com',
  role: 'administrador',
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(defaultUser)
  const [role, setRoleState] = useState<Role>('administrador')

  const setUser = useCallback((u: User | null) => {
    setUserState(u)
    if (u) setRoleState(u.role)
  }, [])

  const setRole = useCallback((r: Role) => {
    setRoleState(r)
    setUserState((prev) => (prev ? { ...prev, role: r } : null))
  }, [])

  const logout = useCallback(() => {
    setUserState(defaultUser)
    setRoleState('administrador')
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        setUser,
        setRole,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export function canAccess(role: Role, path: string): boolean {
  const inversionistaPaths = ['/inversionistas', '/inversionistas/vista', '/paises', '/avance-semana']
  const empresarioPaths = ['/empresarios', '/empresarios/pedidos', '/avance-semana']

  if (role === 'superadmin' || role === 'administrador') return true
  if (role === 'inversionista') return inversionistaPaths.some((p) => path.startsWith(p)) || path === '/avance-semana'
  if (role === 'empresario') return empresarioPaths.some((p) => path.startsWith(p)) || path === '/avance-semana'
  return false
}
