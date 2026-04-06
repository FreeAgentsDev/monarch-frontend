import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

export type Role = 'admin' | 'inversionista' | 'empresario'

export interface User {
  id: string
  name: string
  email: string
  role: Role
  paisCodigo?: string
}

/** Credenciales por rol: cada rol tiene su propio usuario y contraseña */
const CREDENTIALS_BY_ROLE: Record<Role, { username: string; password: string }> = {
  admin: { username: 'admin', password: 'admin123' },
  inversionista: { username: 'inversionista', password: 'inversionista123' },
  empresario: { username: 'empresario', password: 'empresario123' },
}

interface AuthContextValue {
  user: User | null
  role: Role
  setUser: (u: User | null) => void
  logout: () => void
  /** Login con rol explícito (p. ej. editor de tienda). */
  login: (selectedRole: Role, username: string, password: string) => { ok: boolean; error?: string }
  /** Login solo con usuario y contraseña; el rol se deduce de las credenciales. */
  loginWithCredentials: (username: string, password: string) => { ok: boolean; error?: string; role?: Role }
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(null)
  const [role, setRoleState] = useState<Role>('admin')

  const setUser = useCallback((u: User | null) => {
    setUserState(u)
    if (u) setRoleState(u.role)
  }, [])

  const logout = useCallback(() => {
    setUserState(null)
    setRoleState('admin')
  }, [])

  const login = useCallback((selectedRole: Role, username: string, password: string): { ok: boolean; error?: string } => {
    const cred = CREDENTIALS_BY_ROLE[selectedRole]
    const userOk = username.trim().toLowerCase() === cred.username.toLowerCase()
    const passOk = password === cred.password
    if (!userOk || !passOk) return { ok: false, error: 'Usuario o contraseña incorrectos para este rol.' }
    const name = cred.username.charAt(0).toUpperCase() + cred.username.slice(1)
    setUserState({ id: '1', name, email: `${cred.username}@monarch.com`, role: selectedRole })
    setRoleState(selectedRole)
    return { ok: true }
  }, [])

  const loginWithCredentials = useCallback((username: string, password: string): { ok: boolean; error?: string; role?: Role } => {
    const u = username.trim().toLowerCase()
    for (const [r, cred] of Object.entries(CREDENTIALS_BY_ROLE)) {
      const roleKey = r as Role
      if (u === cred.username.toLowerCase() && password === cred.password) {
        const name = cred.username.charAt(0).toUpperCase() + cred.username.slice(1)
        setUserState({ id: '1', name, email: `${cred.username}@monarch.com`, role: roleKey })
        setRoleState(roleKey)
        return { ok: true, role: roleKey }
      }
    }
    return { ok: false, error: 'Usuario o contraseña incorrectos.' }
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        setUser,
        logout,
        login,
        loginWithCredentials,
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
  const inversionistaPaths = ['/mi-panel', '/catalogo', '/crear-pedido']
  const empresarioPaths = ['/mi-panel', '/mi-tienda', '/catalogo', '/crear-pedido']

  if (role === 'admin') return true
  if (role === 'inversionista') return inversionistaPaths.some((p) => path.startsWith(p))
  if (role === 'empresario') return empresarioPaths.some((p) => path.startsWith(p))
  return false
}
