import { Link } from 'react-router-dom'
import { Settings, Coins, Globe } from 'lucide-react'
import ExchangeRatesConfig from '../components/contabilidad/ExchangeRatesConfig'

export default function Configuracion() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Configuración</h1>
        <p className="text-gray-600 mt-1">
          Parámetros del sistema y tasas de cambio
        </p>
      </div>

      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-lg bg-primary-100 flex items-center justify-center">
            <Coins size={24} className="text-primary-600" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">Tasas de cambio</h2>
            <p className="text-sm text-gray-500">Configuración de conversión a COP</p>
          </div>
        </div>
        <ExchangeRatesConfig />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link to="/estado-resultados" className="card hover:shadow-lg transition-shadow flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
            <Globe size={24} className="text-purple-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Estado de Resultados</h3>
            <p className="text-sm text-gray-500">Usa las tasas configuradas para cálculos consolidados</p>
          </div>
        </Link>
        <Link to="/contabilidad" className="card hover:shadow-lg transition-shadow flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
            <Settings size={24} className="text-green-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Cuadro General</h3>
            <p className="text-sm text-gray-500">Recalcula pesos con las tasas configuradas</p>
          </div>
        </Link>
      </div>
    </div>
  )
}
