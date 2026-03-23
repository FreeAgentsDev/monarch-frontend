import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import PanelGestionUsuarios from '../components/PanelGestionUsuarios'

export default function GestionUsuarios() {
  return (
    <div className="space-y-6">
      <div>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-2"
        >
          <ArrowLeft size={16} />
          Volver al Dashboard
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Gestión de usuarios</h1>
        <p className="text-gray-600 mt-1">
          Crear, editar y eliminar usuarios del sistema
        </p>
      </div>

      <PanelGestionUsuarios />
    </div>
  )
}
