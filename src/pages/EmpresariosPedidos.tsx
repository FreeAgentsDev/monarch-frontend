import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ordersApi } from '../services/api'
import type { Order } from '../services/api'
import { Plus, ArrowLeft, Package } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function EmpresariosPedidos() {
  const { user } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ordersApi.getAll().then((res) => {
      setOrders(res.data)
    }).catch(console.error).finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <Link
          to="/avance-semana"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-2"
        >
          <ArrowLeft size={16} />
          Volver
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Mis pedidos</h1>
        <p className="text-gray-600 mt-1">
          Vista del empresario: consulta y realiza tus pedidos aquí.
        </p>
      </div>

      <div className="card bg-primary-50 border-primary-100">
        <p className="text-sm text-gray-700">
          <strong>Vinculación:</strong> Esta vista está vinculada a tu cuenta de empresario. Los pedidos que crees o que estén asociados a tu país/tienda aparecerán aquí.
        </p>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-600 text-white font-medium hover:bg-primary-700"
        >
          <Plus size={18} />
          Nuevo pedido
        </button>
      </div>

      {loading ? (
        <div className="card py-12 text-center text-gray-500">Cargando pedidos...</div>
      ) : (
        <div className="card overflow-hidden p-0">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900">Pedidos</h2>
            <p className="text-sm text-gray-500">Empresario: {user?.name ?? '—'}</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Nº</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Cliente</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-700">Total</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Estado</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-700">Acción</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 20).map((o) => (
                  <tr key={o.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                    <td className="py-3 px-4 font-medium text-gray-900">{o.orderNumber}</td>
                    <td className="py-3 px-4 text-gray-600">{o.customerName}</td>
                    <td className="py-3 px-4 text-right">{o.totalAmount} {o.currency}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                        o.status === 'delivered' ? 'bg-green-100 text-green-800' :
                        o.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                        o.status === 'cancelled' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        to={`/orders/${o.id}`}
                        className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                      >
                        Ver
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {orders.length === 0 && (
            <div className="py-12 text-center text-gray-500 flex flex-col items-center gap-2">
              <Package size={40} className="text-gray-300" />
              No hay pedidos. Usa &quot;Nuevo pedido&quot; para crear uno (flujo en desarrollo).
            </div>
          )}
        </div>
      )}
    </div>
  )
}
