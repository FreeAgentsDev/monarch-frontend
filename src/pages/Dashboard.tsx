import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  TrendingUp, 
  ShoppingBag, 
  DollarSign, 
  Package,
  ArrowUpRight,
  ArrowDownRight,
  Store,
  Calculator,
  CheckCircle,
  Clock,
  Globe,
  Activity
} from 'lucide-react'
import { dashboardApi, ordersApi, shopifyApi, accountingApi, DashboardStats, Order, Shop, Transaction } from '../services/api'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts'
import { format } from 'date-fns'

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [shops, setShops] = useState<Shop[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAllData()
  }, [])

  const loadAllData = async () => {
    try {
      const [statsRes, ordersRes, shopsRes, transactionsRes] = await Promise.all([
        dashboardApi.getStats(),
        ordersApi.getAll(),
        shopifyApi.getShops(),
        accountingApi.getTransactions()
      ])
      
      setStats(statsRes.data)
      setOrders(ordersRes.data)
      setShops(shopsRes.data)
      setTransactions(transactionsRes.data)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Cargando...</div>
      </div>
    )
  }

  if (!stats) return null

  // Calculate additional metrics
  const ordersByStatus = orders.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const statusData = [
    { name: 'Pendiente', value: ordersByStatus.pending || 0, color: '#f59e0b' },
    { name: 'Procesando', value: ordersByStatus.processing || 0, color: '#0ea5e9' },
    { name: 'Enviado', value: ordersByStatus.shipped || 0, color: '#8b5cf6' },
    { name: 'Entregado', value: ordersByStatus.delivered || 0, color: '#10b981' },
    { name: 'Cancelado', value: ordersByStatus.cancelled || 0, color: '#ef4444' },
  ].filter(item => item.value > 0)

  const activeShops = shops.filter(s => s.isActive).length
  const totalRevenue = transactions
    .filter(t => t.type === 'sale')
    .reduce((sum, t) => sum + t.baseCurrencyAmount, 0)
  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.baseCurrencyAmount, 0)
  const netProfit = totalRevenue - totalExpenses

  // Prepare chart data
  const salesData = stats.salesByCountry.map(item => ({
    name: item.country,
    ventas: item.amount,
  }))

  const recentDays = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (6 - i))
    return format(date, 'EEE')
  })

  const dailySalesData = recentDays.map((day) => ({
    name: day,
    ventas: Math.floor(Math.random() * 5000) + 2000,
  }))

  const shopsData = shops.map(shop => ({
    name: shop.country,
    pedidos: shop.ordersCount,
    activa: shop.isActive ? 1 : 0
  }))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Ejecutivo</h1>
          <p className="text-gray-600 mt-1">Vista general consolidada de todas las operaciones de Monarch</p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Activity className="w-4 h-4" />
          <span>Actualizado hace unos momentos</span>
        </div>
      </div>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card bg-gradient-to-br from-primary-50 to-primary-100 border-primary-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-primary-700 font-medium">Ventas Totales</p>
              <p className="text-3xl font-bold text-primary-900 mt-2">
                ${stats.totalSales.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
              </p>
              <div className="flex items-center mt-3 text-sm">
                <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                <span className="text-green-700 font-semibold">
                  {stats.growthRate > 0 ? '+' : ''}{stats.growthRate}%
                </span>
                <span className="text-primary-600 ml-2">vs mes anterior</span>
              </div>
            </div>
            <div className="w-16 h-16 bg-primary-200 rounded-xl flex items-center justify-center">
              <DollarSign className="w-8 h-8 text-primary-700" />
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-700 font-medium">Total de Pedidos</p>
              <p className="text-3xl font-bold text-blue-900 mt-2">
                {stats.totalOrders.toLocaleString('es-ES')}
              </p>
              <div className="flex items-center mt-3 text-sm">
                <ArrowUpRight className="w-4 h-4 text-green-600 mr-1" />
                <span className="text-green-700 font-semibold">+12%</span>
                <span className="text-blue-600 ml-2">vs mes anterior</span>
              </div>
            </div>
            <div className="w-16 h-16 bg-blue-200 rounded-xl flex items-center justify-center">
              <ShoppingBag className="w-8 h-8 text-blue-700" />
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-700 font-medium">Ticket Promedio</p>
              <p className="text-3xl font-bold text-purple-900 mt-2">
                ${stats.averageTicket.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
              </p>
              <div className="flex items-center mt-3 text-sm">
                <ArrowDownRight className="w-4 h-4 text-red-500 mr-1" />
                <span className="text-red-600 font-semibold">-3%</span>
                <span className="text-purple-600 ml-2">vs mes anterior</span>
              </div>
            </div>
            <div className="w-16 h-16 bg-purple-200 rounded-xl flex items-center justify-center">
              <Package className="w-8 h-8 text-purple-700" />
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-700 font-medium">Utilidad Neta</p>
              <p className="text-3xl font-bold text-green-900 mt-2">
                ${netProfit.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
              </p>
              <div className="flex items-center mt-3 text-sm">
                <CheckCircle className="w-4 h-4 text-green-600 mr-1" />
                <span className="text-green-700 font-semibold">Positivo</span>
                <span className="text-green-600 ml-2">este mes</span>
              </div>
            </div>
            <div className="w-16 h-16 bg-green-200 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-8 h-8 text-green-700" />
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Tiendas Activas</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {activeShops} / {shops.length}
              </p>
            </div>
            <Store className="w-8 h-8 text-primary-600" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Países</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {stats.salesByCountry.length}
              </p>
            </div>
            <Globe className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Transacciones</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {transactions.length}
              </p>
            </div>
            <Calculator className="w-8 h-8 text-purple-600" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pedidos Pendientes</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {ordersByStatus.pending || 0}
              </p>
            </div>
            <Clock className="w-8 h-8 text-yellow-600" />
          </div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card lg:col-span-2">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Ventas por País</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="ventas" fill="#0ea5e9" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Estados de Pedidos</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Tendencia de Ventas (7 días)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailySalesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="ventas" 
                stroke="#0ea5e9" 
                strokeWidth={3}
                dot={{ fill: '#0ea5e9', r: 5 }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Pedidos por Tienda</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={shopsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="pedidos" fill="#10b981" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Modules Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Link to="/orders" className="card hover:shadow-lg transition-shadow cursor-pointer">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <ShoppingBag className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Gestión de Pedidos</h3>
              <p className="text-sm text-gray-500">{orders.length} pedidos totales</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Pendientes:</span>
              <span className="font-medium">{ordersByStatus.pending || 0}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Procesando:</span>
              <span className="font-medium">{ordersByStatus.processing || 0}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Enviados:</span>
              <span className="font-medium">{ordersByStatus.shipped || 0}</span>
            </div>
          </div>
        </Link>

        <Link to="/accounting" className="card hover:shadow-lg transition-shadow cursor-pointer">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Calculator className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Contabilidad</h3>
              <p className="text-sm text-gray-500">{transactions.length} transacciones</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Ingresos:</span>
              <span className="font-medium text-green-600">
                ${totalRevenue.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Gastos:</span>
              <span className="font-medium text-red-600">
                ${totalExpenses.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Utilidad:</span>
              <span className="font-medium text-primary-600">
                ${netProfit.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </Link>

        <Link to="/shopify" className="card hover:shadow-lg transition-shadow cursor-pointer">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Store className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Integración Shopify</h3>
              <p className="text-sm text-gray-500">{shops.length} tiendas configuradas</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Activas:</span>
              <span className="font-medium text-green-600">{activeShops}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Con errores:</span>
              <span className="font-medium text-red-600">
                {shops.filter(s => s.syncStatus === 'error').length}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Total pedidos:</span>
              <span className="font-medium">
                {shops.reduce((sum, s) => sum + s.ordersCount, 0)}
              </span>
            </div>
          </div>
        </Link>
      </div>

      {/* Recent Orders & Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Pedidos Recientes</h2>
            <Link to="/orders" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
              Ver todos →
            </Link>
          </div>
          <div className="space-y-3">
            {stats.recentOrders.slice(0, 5).map((order) => (
              <Link
                key={order.id}
                to={`/orders/${order.id}`}
                className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100"
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${
                    order.status === 'pending' ? 'bg-yellow-500' :
                    order.status === 'processing' ? 'bg-blue-500' :
                    order.status === 'shipped' ? 'bg-purple-500' :
                    order.status === 'delivered' ? 'bg-green-500' : 'bg-red-500'
                  }`} />
                  <div>
                    <p className="font-medium text-gray-900">#{order.orderNumber}</p>
                    <p className="text-sm text-gray-500">{order.customerName} • {order.country}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">
                    {order.currency} {order.totalAmount.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs text-gray-500">{format(new Date(order.createdAt), 'dd MMM')}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Productos Top</h2>
          <div className="space-y-3">
            {stats.topProducts.map((product, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                    <span className="text-primary-600 font-bold text-sm">#{index + 1}</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{product.name}</p>
                    <p className="text-sm text-gray-500">{product.quantity} unidades vendidas</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">
                    ${product.revenue.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
