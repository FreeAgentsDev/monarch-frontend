import { useState, FormEvent } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { Lock, AtSign, User, LogIn, ShieldCheck, Globe2, TrendingUp } from 'lucide-react'
import { useAuth, type Role } from '../context/AuthContext'
import { useRealApi } from '../services/http'

const HOME_BY_ROLE: Record<Role, string> = {
  admin: '/dashboard',
  inversionista: '/mi-panel',
  empresario: '/mi-panel',
}

export default function Login() {
  const { loginWithCredentials, user, role } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (user) return <Navigate to={HOME_BY_ROLE[role]} replace />

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const result = await loginWithCredentials(username, password)
    setLoading(false)
    if (result.ok && result.role) {
      navigate(HOME_BY_ROLE[result.role], { replace: true })
      return
    }
    setError(result.error ?? 'Error al iniciar sesion.')
  }

  const IdIcon = useRealApi ? AtSign : User

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-gray-50">
      {/* Panel de marca (izquierda) */}
      <div className="relative hidden lg:flex flex-col justify-between overflow-hidden brand-gradient p-12 text-white">
        {/* Decoración sutil */}
        <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full border border-white/10" />
        <div className="pointer-events-none absolute -right-10 top-20 h-80 w-80 rounded-full border border-white/10" />
        <div className="pointer-events-none absolute -bottom-32 -left-24 h-96 w-96 rounded-full bg-white/5 blur-2xl" />

        <div className="relative flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/20 backdrop-blur">
            <span className="text-xl font-bold">M</span>
          </div>
          <span className="text-lg font-semibold tracking-tight">Monarch</span>
        </div>

        <div className="relative max-w-md">
          <h2 className="text-3xl font-bold leading-tight tracking-tight text-white">
            Gestión internacional de tu red de joyería
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-white/70">
            Empresarios, inversionistas, catálogo y finanzas en un solo lugar. Control total,
            visibilidad por país y decisiones con datos en tiempo real.
          </p>
          <div className="mt-8 space-y-3 text-sm text-white/80">
            <div className="flex items-center gap-3">
              <Globe2 size={18} className="text-white/60" /> Operación multi-país centralizada
            </div>
            <div className="flex items-center gap-3">
              <TrendingUp size={18} className="text-white/60" /> Ventas y utilidad por empresario
            </div>
            <div className="flex items-center gap-3">
              <ShieldCheck size={18} className="text-white/60" /> Accesos por rol y datos protegidos
            </div>
          </div>
        </div>

        <p className="relative text-xs text-white/40">© {new Date().getFullYear()} Monarch · Sistema de Gestión</p>
      </div>

      {/* Formulario (derecha) */}
      <div className="flex flex-col items-center justify-center px-4 py-12 sm:px-8">
        <div className="w-full max-w-sm">
          {/* Marca compacta (móvil) */}
          <div className="mb-8 flex items-center justify-center gap-2 lg:hidden">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl brand-gradient text-white shadow-sm">
              <span className="text-xl font-bold">M</span>
            </div>
            <span className="text-xl font-bold text-gray-900">Monarch</span>
          </div>

          <div className="mb-7">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">Bienvenido de nuevo</h1>
            <p className="mt-1.5 text-sm text-gray-500">Inicia sesión para acceder a tu panel.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="login-user" className="mb-1.5 block text-sm font-medium text-gray-700">
                {useRealApi ? 'Email' : 'Usuario'}
              </label>
              <div className="relative">
                <IdIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  id="login-user"
                  type={useRealApi ? 'email' : 'text'}
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={useRealApi ? 'tucorreo@empresa.com' : 'Usuario'}
                  className="input pl-10"
                />
              </div>
            </div>

            <div>
              <label htmlFor="login-password" className="mb-1.5 block text-sm font-medium text-gray-700">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
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

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-2.5">
              {loading ? (
                <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <>
                  <LogIn size={18} />
                  Entrar
                </>
              )}
            </button>
          </form>

          {/* Credenciales de ayuda: reales (API) o demo. */}
          <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50/70 px-4 py-3 text-xs text-gray-600">
            <p className="mb-1 font-semibold text-gray-700">
              {useRealApi ? 'Acceso de administrador' : 'Credenciales de demostración'}
            </p>
            {useRealApi ? (
              <p>
                <code className="rounded bg-white px-1 ring-1 ring-gray-200">admin@monarch.local</code> /{' '}
                <code className="rounded bg-white px-1 ring-1 ring-gray-200">admin123</code>
              </p>
            ) : (
              <div className="space-y-1">
                <p><code className="rounded bg-white px-1 ring-1 ring-gray-200">admin</code> / <code className="rounded bg-white px-1 ring-1 ring-gray-200">admin123</code></p>
                <p><code className="rounded bg-white px-1 ring-1 ring-gray-200">inversionista</code> / <code className="rounded bg-white px-1 ring-1 ring-gray-200">inversionista123</code></p>
                <p><code className="rounded bg-white px-1 ring-1 ring-gray-200">empresario</code> / <code className="rounded bg-white px-1 ring-1 ring-gray-200">empresario123</code></p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
