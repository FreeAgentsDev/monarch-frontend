import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { BarChart3, Users, ShoppingBag, TrendingUp, ArrowRight } from 'lucide-react'

export default function AvanceSemana() {
  const { role } = useAuth()

  const kpisInversionistas = [
    { label: 'Pedidos mayoristas (semana)', value: '24', change: '+12%' },
    { label: 'Países activos', value: '6', change: '' },
    { label: 'Catálogos descargados', value: '18', change: '+5' },
  ]
  const kpisEmpresarios = [
    { label: 'Pedidos (semana)', value: '142', change: '+8%' },
    { label: 'Empresarios activos', value: '28', change: '' },
    { label: 'Ticket promedio', value: 'USD 89', change: '+3%' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Avance de la semana</h1>
        <p className="text-gray-600 mt-1">
          Enfoque en inversionistas y empresarios: métricas y accesos rápidos.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
              <Users size={24} className="text-purple-600" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">Inversionistas</h2>
              <p className="text-sm text-gray-500">Métricas mayoristas y por país</p>
            </div>
          </div>
          <ul className="space-y-2 mb-4">
            {kpisInversionistas.map((k) => (
              <li key={k.label} className="flex justify-between text-sm">
                <span className="text-gray-600">{k.label}</span>
                <span className="font-medium text-gray-900">{k.value} {k.change && <span className="text-green-600">{k.change}</span>}</span>
              </li>
            ))}
          </ul>
          <Link
            to="/inversionistas"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-700"
          >
            Ir a Inversionistas
            <ArrowRight size={16} />
          </Link>
        </div>

        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
              <ShoppingBag size={24} className="text-green-600" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">Empresarios</h2>
              <p className="text-sm text-gray-500">Pedidos y actividad</p>
            </div>
          </div>
          <ul className="space-y-2 mb-4">
            {kpisEmpresarios.map((k) => (
              <li key={k.label} className="flex justify-between text-sm">
                <span className="text-gray-600">{k.label}</span>
                <span className="font-medium text-gray-900">{k.value} {k.change && <span className="text-green-600">{k.change}</span>}</span>
              </li>
            ))}
          </ul>
          <Link
            to="/empresarios/pedidos"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-700"
          >
            Mis pedidos
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      <div className="card bg-primary-50 border-primary-100">
        <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
          <TrendingUp size={20} />
          Resumen
        </h3>
        <p className="text-sm text-gray-700">
          Vista orientada a <strong>inversionistas</strong> (catálogos por país, mayorista, descargas sin precios) y <strong>empresarios</strong> (pedidos propios). 
          Rol actual: <strong>{role}</strong>. Cambia el rol en la barra superior para ver el menú correspondiente.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          to="/inversionistas"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-600 text-white text-sm font-medium hover:bg-primary-700"
        >
          Inversionistas
        </Link>
        <Link
          to="/empresarios/pedidos"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50"
        >
          Pedidos empresarios
        </Link>
        <Link
          to="/analisis"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50"
        >
          <BarChart3 size={18} />
          Análisis de datos
        </Link>
      </div>
    </div>
  )
}
