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
  LogOut,
} from 'lucide-react'

interface LayoutProps {
  children: ReactNode
}

const ALL_NAV: { name: string; href: string; icon: typeof LayoutDashboard; roles: Role[]; section?: string }[] = [
  // Admin
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['admin'] },
  { name: 'Pedidos', href: '/orders', icon: ShoppingBag, roles: ['admin'] },
  { name: 'Paises', href: '/paises', icon: MapPin, roles: ['admin'] },
  { name: 'Contabilidad', href: '/contabilidad', icon: Calculator, roles: ['admin'], section: 'Finanzas' },
  { name: 'Estado de Resultados', href: '/estado-resultados', icon: FileSpreadsheet, roles: ['admin'] },
  { name: 'Analisis', href: '/analisis', icon: BarChart3, roles: ['admin'] },
  { name: 'Empresarios', href: '/empresarios', icon: Store, roles: ['admin'], section: 'Red' },
  { name: 'Inversionistas', href: '/inversionistas', icon: Users, roles: ['admin'] },
  { name: 'Gestion catalogo', href: '/gestion-catalogo', icon: ShoppingBag, roles: ['admin'] },
  { name: 'Rutas', href: '/rutas-entregas', icon: Truck, roles: ['admin'], section: 'Sistema' },
  { name: 'Shopify', href: '/shopify', icon: Store, roles: ['admin'] },
  { name: 'Configuracion', href: '/configuracion', icon: Settings, roles: ['admin'] },
  // Empresario
  { name: 'Mi Panel', href: '/mi-panel', icon: LayoutDashboard, roles: ['empresario'] },
  { name: 'Mi Tienda', href: '/mi-tienda', icon: Store, roles: ['empresario'] },
  { name: 'Catalogo', href: '/catalogo/EC', icon: ShoppingBag, roles: ['empresario'] },
  // Inversionista
  { name: 'Mi Panel', href: '/mi-panel', icon: LayoutDashboard, roles: ['inversionista'] },
  { name: 'Catalogo', href: '/catalogo/EC', icon: ShoppingBag, roles: ['inversionista'] },
]

export default function Layout({ children }: LayoutProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, role, logout } = useAuth()

  const navigation = ALL_NAV.filter((item) => item.roles.includes(role))

  const isActive = (path: string) => {
    const pathBase = path.split('?')[0]
    if (pathBase === '/catalogo/EC') return location.pathname.startsWith('/catalogo')
    return location.pathname === pathBase
  }

  const roleLabels: Record<Role, string> = {
    admin: 'Admin',
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
          <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
            {navigation.map((item, i) => {
              const Icon = item.icon
              const active = isActive(item.href)
              const showSection = item.section && (i === 0 || navigation[i - 1]?.section !== item.section)
              return (
                <div key={item.name + item.href}>
                  {showSection && (
                    <p className="section-label px-3 pt-5 pb-1.5">{item.section}</p>
                  )}
                  <Link
                    to={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
                      active
                        ? 'bg-primary-50 text-primary-700 font-medium shadow-sm shadow-primary-100'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Icon size={18} className={active ? 'text-primary-600' : 'text-gray-400'} />
                    <span>{item.name}</span>
                  </Link>
                </div>
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
              Monarch v1.0
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-100 h-14 flex items-center justify-between px-6 sticky top-0 z-10">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-400 hover:text-gray-700">
            <Menu size={22} />
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <div className="inline-flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-1.5 text-sm">
              <UserCircle size={16} className="text-gray-400 shrink-0" />
              <span className="hidden sm:inline text-gray-600">{user?.name ?? 'Usuario'}</span>
              <span className={`badge ${role === 'admin' ? 'badge-blue' : role === 'empresario' ? 'badge-green' : 'badge-amber'}`}>{roleLabels[role]}</span>
            </div>
            <button type="button" onClick={() => { logout(); navigate('/login', { replace: true }) }}
              className="btn-ghost text-gray-500 hover:text-red-600">
              <LogOut size={16} />
              <span className="hidden sm:inline text-xs">Salir</span>
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}
