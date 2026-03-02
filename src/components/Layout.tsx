import { FormEvent, ReactNode, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { demoStorage } from '../utils/storage'
import { useAuth, type Role } from '../context/AuthContext'
import {
  LayoutDashboard,
  LayoutGrid,
  ShoppingBag,
  Calculator,
  Store,
  Menu,
  X,
  FileSpreadsheet,
  BarChart3,
  MapPin,
  Users,
  Settings,
  Truck,
  UserCircle,
  ChevronDown,
  LogOut,
  Lock,
  User,
} from 'lucide-react'

interface LayoutProps {
  children: ReactNode
}

const ALL_NAV: { name: string; href: string; icon: typeof LayoutDashboard; roles: Role[] }[] = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['superadmin', 'administrador'] },
  { name: 'Pedidos', href: '/orders', icon: ShoppingBag, roles: ['superadmin', 'administrador'] },
  { name: 'Países', href: '/paises', icon: MapPin, roles: ['superadmin', 'administrador', 'inversionista'] },
  { name: 'Contabilidad', href: '/contabilidad', icon: Calculator, roles: ['superadmin', 'administrador'] },
  { name: 'Estado de Resultados', href: '/estado-resultados', icon: FileSpreadsheet, roles: ['superadmin', 'administrador'] },
  { name: 'Análisis de datos', href: '/analisis', icon: BarChart3, roles: ['superadmin', 'administrador', 'inversionista'] },
  { name: 'Inversionistas', href: '/inversionistas', icon: Users, roles: ['superadmin', 'administrador', 'inversionista'] },
  { name: 'Panel Inversionista', href: '/inversionistas/panel', icon: LayoutGrid, roles: ['superadmin', 'administrador', 'inversionista'] },
  { name: 'Vista por país (catálogo)', href: '/inversionistas/vista/EC', icon: Store, roles: ['superadmin', 'administrador', 'inversionista'] },
  { name: 'Avance de la semana', href: '/avance-semana', icon: BarChart3, roles: ['superadmin', 'administrador', 'inversionista', 'empresario'] },
  { name: 'Mis pedidos (empresarios)', href: '/empresarios/pedidos', icon: ShoppingBag, roles: ['superadmin', 'administrador', 'empresario'] },
  { name: 'Rutas (Ecuador)', href: '/rutas-entregas', icon: Truck, roles: ['superadmin', 'administrador'] },
  { name: 'Gestionar países', href: '/gestion-paises', icon: MapPin, roles: ['superadmin', 'administrador'] },
  { name: 'Gestionar inversionistas', href: '/gestion-inversionistas', icon: Users, roles: ['superadmin', 'administrador'] },
  { name: 'Configuración', href: '/configuracion', icon: Settings, roles: ['superadmin', 'administrador'] },
  { name: 'Shopify', href: '/shopify', icon: Store, roles: ['superadmin', 'administrador'] },
]

export default function Layout({ children }: LayoutProps) {
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false)
  const [switchRoleModal, setSwitchRoleModal] = useState<Role | null>(null)
  const [switchUsername, setSwitchUsername] = useState('')
  const [switchPassword, setSwitchPassword] = useState('')
  const [switchError, setSwitchError] = useState('')
  const { user, role, loginAsRole, logout } = useAuth()

  const navigation = ALL_NAV.filter((item) => item.roles.includes(role))

  const tab = new URLSearchParams(location.search).get('tab')
  const isActive = (path: string) => {
    if (location.pathname === '/contabilidad') {
      if (path === '/contabilidad') return tab !== 'estado'
      if (path.includes('tab=estado')) return tab === 'estado'
    }
    const pathBase = path.split('?')[0]
    if (pathBase === '/inversionistas/vista') return location.pathname.startsWith('/inversionistas/vista')
    return location.pathname === pathBase
  }

  const roleLabels: Record<Role, string> = {
    superadmin: 'Superadmin',
    administrador: 'Administrador',
    inversionista: 'Inversionista',
    empresario: 'Empresario',
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-30 h-full w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">M</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Monarch</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href)
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    active
                      ? 'bg-primary-50 text-primary-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon size={20} />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 space-y-2">
            <button
              type="button"
              onClick={() => {
                demoStorage.clear()
                window.location.reload()
              }}
              className="w-full text-xs text-amber-600 hover:text-amber-700 hover:underline"
            >
              Restaurar datos originales
            </button>
            <div className="text-xs text-gray-500 text-center">
              Sistema Monarch v1.0 · Demo persistente
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6 sticky top-0 z-10">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-gray-500 hover:text-gray-700"
          >
            <Menu size={24} />
          </button>
          <div className="flex-1" />
          <div className="flex items-center space-x-4">
            <div className="relative">
              <button
                type="button"
                onClick={() => setRoleDropdownOpen((v) => !v)}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm text-gray-700 hover:bg-gray-50"
              >
                <UserCircle size={18} />
                {user?.name ?? 'Usuario'} · <span className="font-medium">{roleLabels[role]}</span>
                <ChevronDown size={16} />
              </button>
              {roleDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setRoleDropdownOpen(false)} />
                  <div className="absolute right-0 mt-1 py-1 w-52 bg-white rounded-xl border border-gray-200 shadow-lg z-20">
                    <div className="px-3 py-2 border-b border-gray-100">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Rol actual</p>
                      <p className="text-sm font-semibold text-gray-900 mt-0.5">{roleLabels[role]}</p>
                    </div>
                    <div className="py-1">
                      {(['superadmin', 'administrador', 'inversionista', 'empresario'] as Role[]).map((r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => {
                            setRoleDropdownOpen(false)
                            if (r === role) return
                            setSwitchRoleModal(r)
                            setSwitchUsername('')
                            setSwitchPassword('')
                            setSwitchError('')
                          }}
                          className={`w-full text-left px-4 py-2.5 text-sm ${role === r ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}
                        >
                          {roleLabels[r]}
                        </button>
                      ))}
                    </div>
                    <div className="border-t border-gray-100 pt-1">
                      <button
                        type="button"
                        onClick={() => { logout(); setRoleDropdownOpen(false) }}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 font-medium"
                      >
                        <LogOut size={16} />
                        Cerrar sesión
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">{children}</main>
      </div>

      {/* Modal: Iniciar sesión como otro rol */}
      {switchRoleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Iniciar sesión como {roleLabels[switchRoleModal]}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setSwitchRoleModal(null)
                  setSwitchError('')
                }}
                className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                aria-label="Cerrar"
              >
                <X size={20} />
              </button>
            </div>
            <form
              onSubmit={(e: FormEvent) => {
                e.preventDefault()
                setSwitchError('')
                const result = loginAsRole(switchRoleModal, switchUsername, switchPassword)
                if (result.ok) {
                  setSwitchRoleModal(null)
                  setSwitchUsername('')
                  setSwitchPassword('')
                } else {
                  setSwitchError(result.error ?? 'Error al iniciar sesión.')
                }
              }}
              className="p-6 space-y-4"
            >
              {switchError && (
                <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800">
                  {switchError}
                </div>
              )}
              <div>
                <label htmlFor="switch-user" className="block text-sm font-medium text-gray-700 mb-1.5">Usuario</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    id="switch-user"
                    type="text"
                    autoComplete="username"
                    value={switchUsername}
                    onChange={(e) => setSwitchUsername(e.target.value)}
                    placeholder="Usuario de este rol"
                    className="input pl-9"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="switch-password" className="block text-sm font-medium text-gray-700 mb-1.5">Contraseña</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    id="switch-password"
                    type="password"
                    autoComplete="current-password"
                    value={switchPassword}
                    onChange={(e) => setSwitchPassword(e.target.value)}
                    placeholder="••••••••"
                    className="input pl-9"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="btn-primary flex-1 justify-center">
                  Entrar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSwitchRoleModal(null)
                    setSwitchError('')
                  }}
                  className="btn-secondary"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
