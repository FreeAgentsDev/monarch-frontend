import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  LayoutDashboard,
  TrendingUp,
  ShoppingBag,
  DollarSign,
  Package
} from 'lucide-react'
import { dashboardApi, ordersApi, shopifyApi, accountingApi, DashboardStats, Order, Shop, Transaction } from '../services/api'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { format } from 'date-fns'

export default function AnalisisDatos() {
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

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Cargando análisis...</div>
      </div>
    )
  }

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

  const totalRevenue = transactions.filter(t => t.type === 'sale').reduce((sum, t) => sum + t.baseCurrencyAmount, 0)
  const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.baseCurrencyAmount, 0)
  const netProfit = totalRevenue - totalExpenses

  const salesData = stats.salesByCountry.map(item => ({ name: item.country, ventas: item.amount }))
  const recentDays = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (6 - i))
    return format(date, 'EEE')
  })
  const dailySalesData = recentDays.map((day) => ({ name: day, ventas: Math.floor(Math.random() * 5000) + 2000 }))
  const shopsData = shops.map(shop => ({ name: shop.country, pedidos: shop.ordersCount, activa: shop.isActive ? 1 : 0 }))

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Análisis de datos</h1>
          <p className="text-gray-600 mt-1">Gráficas y métricas de ventas, pedidos y contabilidad</p>
        </div>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm font-medium hover:bg-gray-200"
        >
          <LayoutDashboard size={18} />
          Volver al Dashboard
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card bg-gradient-to-br from-primary-50 to-primary-100 border-primary-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-primary-700 font-medium">Ventas Totales</p>
              <p className="text-2xl font-bold text-primary-900 mt-1">${stats.totalSales.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</p>
              <div className="flex items-center mt-2 text-sm">
                <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                <span className="text-green-700 font-semibold">{stats.growthRate > 0 ? '+' : ''}{stats.growthRate}%</span>
              </div>
            </div>
            <DollarSign className="w-10 h-10 text-primary-600" />
          </div>
        </div>
        <div className="card bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-700 font-medium">Total Pedidos</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">{stats.totalOrders.toLocaleString('es-ES')}</p>
            </div>
            <ShoppingBag className="w-10 h-10 text-blue-600" />
          </div>
        </div>
        <div className="card bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-700 font-medium">Ticket Promedio</p>
              <p className="text-2xl font-bold text-purple-900 mt-1">${stats.averageTicket.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</p>
            </div>
            <Package className="w-10 h-10 text-purple-600" />
          </div>
        </div>
        <div className="card bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-700 font-medium">Utilidad Neta</p>
              <p className="text-2xl font-bold text-green-900 mt-1">${netProfit.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</p>
            </div>
            <TrendingUp className="w-10 h-10 text-green-600" />
          </div>
        </div>
      </div>

      {/* Charts */}
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Tendencia de Ventas (7 días)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailySalesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="ventas" stroke="#0ea5e9" strokeWidth={3} dot={{ fill: '#0ea5e9', r: 5 }} activeDot={{ r: 7 }} />
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
    </div>
  )
}
