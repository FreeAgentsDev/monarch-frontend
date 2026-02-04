import { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { demoStorage } from '../utils/storage'
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
  Truck
} from 'lucide-react'
import { useState } from 'react'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Pedidos', href: '/orders', icon: ShoppingBag },
    { name: 'Países', href: '/paises', icon: MapPin },
    { name: 'Contabilidad', href: '/contabilidad', icon: Calculator },
    { name: 'Estado de Resultados', href: '/contabilidad?tab=estado', icon: FileSpreadsheet },
    { name: 'Análisis de datos', href: '/analisis', icon: BarChart3 },
    { name: 'Inversionistas', href: '/inversionistas', icon: Users },
    { name: 'Rutas (Ecuador)', href: '/rutas-entregas', icon: Truck },
    { name: 'Configuración', href: '/configuracion', icon: Settings },
    { name: 'Shopify', href: '/shopify', icon: Store },
  ]

  const tab = new URLSearchParams(location.search).get('tab')
  const isActive = (path: string) => {
    if (location.pathname === '/contabilidad') {
      if (path === '/contabilidad') return tab !== 'estado'
      if (path.includes('tab=estado')) return tab === 'estado'
    }
    return location.pathname === path.split('?')[0]
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
            <div className="text-sm text-gray-600">
              Bienvenido, <span className="font-medium">Admin</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}
