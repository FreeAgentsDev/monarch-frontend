import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Package, User, MapPin, Calendar, DollarSign } from 'lucide-react'
import { ordersApi, Order } from '../services/api'
import { format } from 'date-fns'

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
}

const statusLabels = {
  pending: 'Pendiente',
  processing: 'Procesando',
  shipped: 'Enviado',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
}

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      loadOrder(id)
    }
  }, [id])

  const loadOrder = async (orderId: string) => {
    try {
      const response = await ordersApi.getById(orderId)
      setOrder(response.data)
    } catch (error) {
      console.error('Error loading order:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Cargando pedido...</div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">Pedido no encontrado</p>
        <Link to="/orders" className="text-primary-600 hover:text-primary-700">
          Volver a pedidos
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            to="/orders"
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ArrowLeft size={24} />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Pedido #{order.orderNumber}</h1>
            <p className="text-gray-600 mt-1">{order.storeName}</p>
          </div>
        </div>
        <span
          className={`inline-flex px-4 py-2 text-sm font-semibold rounded-full ${
            statusColors[order.status]
          }`}
        >
          {statusLabels[order.status]}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Items del Pedido</h2>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{item.title}</p>
                    <p className="text-sm text-gray-500 mt-1">SKU: {item.sku}</p>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-sm text-gray-500">Cantidad: {item.quantity}</p>
                    <p className="font-medium text-gray-900 mt-1">
                      {order.currency} {item.total.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order History */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Historial</h2>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-primary-600 rounded-full mt-2" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Pedido creado</p>
                  <p className="text-xs text-gray-500">
                    {format(new Date(order.createdAt), "dd 'de' MMMM 'de' yyyy 'a las' HH:mm")}
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-gray-300 rounded-full mt-2" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Última actualización</p>
                  <p className="text-xs text-gray-500">
                    {format(new Date(order.updatedAt), "dd 'de' MMMM 'de' yyyy 'a las' HH:mm")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Info */}
          <div className="card">
            <div className="flex items-center space-x-2 mb-4">
              <User className="w-5 h-5 text-gray-400" />
              <h2 className="text-lg font-semibold text-gray-900">Cliente</h2>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Nombre</p>
                <p className="font-medium text-gray-900">{order.customerName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium text-gray-900">{order.customerEmail}</p>
              </div>
            </div>
          </div>

          {/* Order Info */}
          <div className="card">
            <div className="flex items-center space-x-2 mb-4">
              <Package className="w-5 h-5 text-gray-400" />
              <h2 className="text-lg font-semibold text-gray-900">Información</h2>
            </div>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">País</p>
                  <p className="font-medium text-gray-900">{order.country}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Fecha</p>
                  <p className="font-medium text-gray-900">
                    {format(new Date(order.createdAt), 'dd MMM yyyy')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Total */}
          <div className="card bg-primary-50 border-primary-200">
            <div className="flex items-center space-x-2 mb-4">
              <DollarSign className="w-5 h-5 text-primary-600" />
              <h2 className="text-lg font-semibold text-primary-900">Total</h2>
            </div>
            <p className="text-3xl font-bold text-primary-900">
              {order.currency} {order.totalAmount.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
