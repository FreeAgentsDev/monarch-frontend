import { Link } from 'react-router-dom'
import { MapPin, Truck, Package, ChevronRight } from 'lucide-react'

const RUTAS_ECUADOR = [
  { id: '1', nombre: 'Quito - Norte', zonas: ['La Carolina', 'Iñaquito', ' González Suárez'], pedidos: 24 },
  { id: '2', nombre: 'Quito - Sur', zonas: ['La Villaflora', 'Quitumbe', 'El Recreo'], pedidos: 18 },
  { id: '3', nombre: 'Guayaquil - Centro', zonas: ['Urdesa', 'Sauces', 'Alborada'], pedidos: 31 },
  { id: '4', nombre: 'Guayaquil - Periferia', zonas: ['Samborondón', 'Daule', 'Durán'], pedidos: 12 },
  { id: '5', nombre: 'Cuenca', zonas: ['Centro', 'El Vergel', 'Narancay'], pedidos: 9 },
]

export default function RutasEntregas() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Rutas de entregas — Ecuador</h1>
        <p className="text-gray-600 mt-1">
          Gestión de rutas y zonas de entrega para el mercado ecuatoriano
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
            <MapPin size={24} className="text-blue-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">5</p>
            <p className="text-sm text-gray-500">Rutas activas</p>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
            <Package size={24} className="text-green-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">94</p>
            <p className="text-sm text-gray-500">Pedidos esta semana</p>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center">
            <Truck size={24} className="text-amber-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">15</p>
            <p className="text-sm text-gray-500">Zonas cubiertas</p>
          </div>
        </div>
      </div>

      <div className="card overflow-hidden p-0">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900">Rutas por zona</h2>
          <p className="text-sm text-gray-500">Organización de entregas en Ecuador</p>
        </div>
        <div className="divide-y divide-gray-100">
          {RUTAS_ECUADOR.map((ruta) => (
            <div key={ruta.id} className="px-6 py-4 hover:bg-gray-50/50 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center">
                  <MapPin size={20} className="text-primary-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{ruta.nombre}</h3>
                  <p className="text-sm text-gray-500">{ruta.zonas.join(' · ')}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-700">{ruta.pedidos} pedidos</span>
                <ChevronRight size={20} className="text-gray-400" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card bg-amber-50 border-amber-100">
        <p className="text-sm text-gray-700">
          <strong>Integración con Pancake:</strong> En producción se conectará con Pancake para automatización de guías, seguimientos, novedades y re-marketing.
        </p>
      </div>

      <Link
        to="/orders?country=ec"
        className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium"
      >
        ← Ver pedidos de Ecuador
      </Link>
    </div>
  )
}
