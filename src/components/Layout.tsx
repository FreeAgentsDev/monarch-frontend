import { ReactNode, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { demoStorage } from '../utils/storage'
import { useAuth, type Role } from '../context/AuthContext'
import {
  LayoutDashboard,
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
  Shield,
  LogOut,
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
  { name: 'Vista por país (catálogo)', href: '/inversionistas/vista/EC', icon: Store, roles: ['superadmin', 'administrador', 'inversionista'] },
  { name: 'Panel inversionista', href: '/inversionistas/panel', icon: BarChart3, roles: ['superadmin', 'administrador', 'inversionista'] },
  { name: 'Avance de la semana', href: '/avance-semana', icon: BarChart3, roles: ['superadmin', 'administrador', 'inversionista', 'empresario'] },
  { name: 'Mi tienda (empresario)', href: '/empresarios/tienda', icon: Store, roles: ['superadmin', 'administrador', 'empresario'] },
  { name: 'Panel empresario', href: '/empresarios/panel', icon: UserCircle, roles: ['superadmin', 'administrador', 'empresario'] },
  { name: 'Vista por país (empresario)', href: '/empresarios/vista/EC', icon: Store, roles: ['superadmin', 'administrador', 'empresario'] },
  { name: 'Mis pedidos (empresarios)', href: '/empresarios/pedidos', icon: ShoppingBag, roles: ['superadmin', 'administrador', 'empresario'] },
  { name: 'Gestionar empresarios', href: '/gestion-empresarios', icon: Users, roles: ['superadmin', 'administrador'] },
  { name: 'Rutas (Ecuador)', href: '/rutas-entregas', icon: Truck, roles: ['superadmin', 'administrador'] },
  { name: 'Gestionar países', href: '/gestion-paises', icon: MapPin, roles: ['superadmin', 'administrador'] },
  { name: 'Gestionar inversionistas', href: '/gestion-inversionistas', icon: Users, roles: ['superadmin', 'administrador'] },
  { name: 'Gestión de usuarios', href: '/gestion-usuarios', icon: Shield, roles: ['superadmin', 'administrador'] },
  { name: 'Configuración', href: '/configuracion', icon: Settings, roles: ['superadmin', 'administrador'] },
  { name: 'Shopify', href: '/shopify', icon: Store, roles: ['superadmin', 'administrador'] },
]

export default function Layout({ children }: LayoutProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, role, logout } = useAuth()

  const navigation = ALL_NAV.filter((item) => item.roles.includes(role))

  const tab = new URLSearchParams(location.search).get('tab')
  const isActive = (path: string) => {
    if (location.pathname === '/contabilidad') {
      if (path === '/contabilidad') return tab !== 'estado'
      if (path.includes('tab=estado')) return tab === 'estado'
    }
    const pathBase = path.split('?')[0]
    if (pathBase === '/inversionistas/vista') return location.pathname.startsWith('/inversionistas/vista')
    if (pathBase === '/empresarios/vista') return location.pathname.startsWith('/empresarios/vista')
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
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700">
              <UserCircle size={18} className="text-gray-500 shrink-0" />
              <span className="hidden sm:inline font-medium text-gray-900">{user?.name ?? 'Usuario'}</span>
              <span className="text-gray-400 hidden sm:inline">·</span>
              <span className="font-medium text-primary-700">{roleLabels[role]}</span>
            </div>
            <button
              type="button"
              onClick={() => {
                logout()
                navigate('/login', { replace: true })
              }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <LogOut size={18} />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}
