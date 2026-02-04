import { Link } from 'react-router-dom'
import { Package, BarChart3, Lock, BookOpen, ShoppingBag, Settings } from 'lucide-react'
import { usePaises } from '../hooks/usePaisesInversionistas'

export default function Inversionistas() {
  const { paises } = usePaises()
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Inversionistas y Mayoristas</h1>
        <p className="text-gray-600 mt-1">
          Gestión de acceso, catálogos y estadísticas para empresarios que invierten y venden
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
              <Lock size={24} className="text-purple-600" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">Acceso por país</h2>
              <p className="text-sm text-gray-500">Liberación de acceso para cada país</p>
            </div>
          </div>
          <p className="text-gray-600 text-sm mb-4">
            Nosotros liberamos el acceso para cada país. Los inversionistas pueden operar solo en los mercados autorizados.
          </p>
          <div className="flex flex-wrap gap-2">
            {paises.map((p) => (
              <span key={p.id} className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-sm">{p.nombre}</span>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
              <Package size={24} className="text-blue-600" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">Catálogo independiente</h2>
              <p className="text-sm text-gray-500">Precios por país</p>
            </div>
          </div>
          <p className="text-gray-600 text-sm">
            Catálogo independiente con precios específicos de cada país. Cada mercado tiene sus propias condiciones de mayorista.
          </p>
        </div>

        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center">
              <BookOpen size={24} className="text-amber-600" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">Banco de contenido</h2>
              <p className="text-sm text-gray-500">Contenido utilizable</p>
            </div>
          </div>
          <p className="text-gray-600 text-sm">
            Banco de contenido utilizable para que los empresarios puedan promocionar los productos de forma consistente.
          </p>
        </div>

        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
              <ShoppingBag size={24} className="text-green-600" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">Catálogo sin inversión</h2>
              <p className="text-sm text-gray-500">Para clientes que venden sin invertir</p>
            </div>
          </div>
          <p className="text-gray-600 text-sm">
            Despliegue de catálogo especial para clientes que venden sin invertir. Acceso a comisiones sin capital inicial.
          </p>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-lg bg-primary-100 flex items-center justify-center">
            <BarChart3 size={24} className="text-primary-600" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">Estadísticas por empresario</h2>
            <p className="text-sm text-gray-500">Sumatoria de pedidos y productos</p>
          </div>
        </div>
        <p className="text-gray-600 text-sm mb-4">
          Sumatoria de todos los pedidos de cada empresario de forma independiente. Estadísticas de los productos que adquieren.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 font-medium text-gray-700">Empresario</th>
                <th className="text-right py-2 font-medium text-gray-700">Pedidos</th>
                <th className="text-right py-2 font-medium text-gray-700">Productos</th>
                <th className="text-right py-2 font-medium text-gray-700">Total</th>
              </tr>
            </thead>
            <tbody>
              {['María G.', 'Carlos R.', 'Ana L.', 'Pedro M.'].map((name, i) => (
                <tr key={i} className="border-b border-gray-100">
                  <td className="py-2 text-gray-900">{name}</td>
                  <td className="text-right py-2 text-gray-600">{12 + i * 3}</td>
                  <td className="text-right py-2 text-gray-600">{28 + i * 5}</td>
                  <td className="text-right py-2 font-medium">${(1500 + i * 800).toLocaleString('es-ES')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card bg-primary-50 border-primary-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <p className="text-sm text-gray-700">
          <strong>Gestión completa:</strong> Crea inversionistas, asígnales países y vincula sus tiendas Shopify por país.
        </p>
        <Link
          to="/gestion-inversionistas"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 whitespace-nowrap self-start sm:self-auto"
        >
          <Settings size={18} />
          Gestionar inversionistas
        </Link>
      </div>
    </div>
  )
}
