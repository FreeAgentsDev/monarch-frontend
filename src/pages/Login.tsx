import { useState, FormEvent } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { Lock, User, LogIn } from 'lucide-react'
import { useAuth, type Role } from '../context/AuthContext'

const HOME_BY_ROLE: Record<Role, string> = {
  superadmin: '/dashboard',
  administrador: '/dashboard',
  inversionista: '/inversionistas/panel',
  empresario: '/avance-semana',
}

export default function Login() {
  const { loginWithCredentials, user, role } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (user) return <Navigate to={HOME_BY_ROLE[role]} replace />

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const result = loginWithCredentials(username, password)
    setLoading(false)
    if (result.ok && result.role) {
      navigate(HOME_BY_ROLE[result.role], { replace: true })
      return
    }
    setError(result.error ?? 'Error al iniciar sesión.')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xl shadow-gray-200/50 overflow-hidden">
          <div className="px-8 pt-10 pb-2 text-center border-b border-gray-100">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary-600 text-white mb-5">
              <span className="text-2xl font-bold">M</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900">Monarch</h1>
            <p className="text-sm text-gray-500 mt-1">Sistema de Gestión Internacional</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-5">
            <h2 className="text-lg font-semibold text-gray-900">Iniciar sesión</h2>

            {error && (
              <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="login-user" className="block text-sm font-medium text-gray-700 mb-1.5">
                Usuario
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  id="login-user"
                  type="text"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Usuario"
                  className="input pl-10"
                />
              </div>
            </div>

            <div>
              <label htmlFor="login-password" className="block text-sm font-medium text-gray-700 mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  id="login-password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input pl-10"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center py-3 disabled:opacity-50"
            >
              {loading ? (
                <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <>
                  <LogIn size={20} />
                  Entrar
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Monarch v1.0
        </p>
      </div>
    </div>
  )
}
