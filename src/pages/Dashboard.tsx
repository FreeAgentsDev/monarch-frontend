import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ShoppingBag,
  Calculator,
  BarChart3,
  FileSpreadsheet,
  Activity
} from 'lucide-react'
import { dashboardApi, ordersApi, accountingApi, DashboardStats, Order, Transaction } from '../services/api'
import { format } from 'date-fns'

interface CuadroRow {
  mes: string
  colombia: number
  ecuador: number
  espana: number
  chile: number
  repDominicana: number
  costaRica: number
  totalPesos?: number
}

interface CuadroBlock {
  columns: string[]
  rows: CuadroRow[]
}

interface CuadroGeneral {
  title: string
  columns?: string[]
  rows?: CuadroRow[]
  pesos?: CuadroBlock
  local?: CuadroBlock
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [cuadro, setCuadro] = useState<CuadroGeneral | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAllData()
  }, [])

  const loadAllData = async () => {
    try {
      const [statsRes, cuadroRes, ordersRes, transactionsRes] = await Promise.all([
        dashboardApi.getStats(),
        accountingApi.getCuadroGeneral(),
        ordersApi.getAll(),
        accountingApi.getTransactions()
      ])
      setStats(statsRes.data)
      setCuadro(cuadroRes.data as CuadroGeneral)
      setOrders(ordersRes.data)
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

  if (!stats || !cuadro) return null

  const cuadroRows = cuadro.pesos?.rows ?? cuadro.rows ?? []
  const totalRevenue = transactions.filter(t => t.type === 'sale').reduce((sum, t) => sum + t.baseCurrencyAmount, 0)
  const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.baseCurrencyAmount, 0)
  const netProfit = totalRevenue - totalExpenses

  const formatNum = (n: number) => n.toLocaleString('es-ES', { maximumFractionDigits: 0 })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Contabilidad consolidada por países — vista similar a tu Excel</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Activity className="w-4 h-4" />
          <span>Actualizado hace unos momentos</span>
        </div>
      </div>

      {/* KPIs rápidos */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card py-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Ventas totales</p>
          <p className="text-xl font-bold text-gray-900 mt-1">${stats.totalSales.toLocaleString('es-ES', { maximumFractionDigits: 0 })}</p>
        </div>
        <div className="card py-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Pedidos</p>
          <p className="text-xl font-bold text-gray-900 mt-1">{stats.totalOrders}</p>
        </div>
        <div className="card py-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Utilidad neta</p>
          <p className={`text-xl font-bold mt-1 ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            ${netProfit.toLocaleString('es-ES', { maximumFractionDigits: 0 })}
          </p>
        </div>
        <div className="card py-4 flex flex-col justify-center">
          <Link to="/analisis" className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium text-sm">
            <BarChart3 size={18} />
            Ver análisis de datos
          </Link>
        </div>
      </div>

      {/* Cuadro General - tabla tipo Excel */}
      <div className="card overflow-hidden p-0">
        <div className="px-6 py-4 border-b border-gray-200 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-gray-900">{cuadro.title}</h2>
          <Link to="/contabilidad" className="text-sm text-primary-600 hover:text-primary-700 font-medium">Ver cuadro completo (moneda local / pesos) →</Link>
          <div className="flex items-center gap-2">
            <Link
              to="/contabilidad?tab=estado"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-600 text-white text-sm font-medium hover:bg-primary-700"
            >
              <FileSpreadsheet size={18} />
              Estado de Resultados
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
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-sm">
            <thead>
              <tr className="bg-gray-100 border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-900 sticky left-0 bg-gray-100 z-10">MES</th>
                <th className="text-right py-3 px-3 font-semibold text-gray-700">Colombia</th>
                <th className="text-right py-3 px-3 font-semibold text-gray-700">Ecuador</th>
                <th className="text-right py-3 px-3 font-semibold text-gray-700">España</th>
                <th className="text-right py-3 px-3 font-semibold text-gray-700">Chile</th>
                <th className="text-right py-3 px-3 font-semibold text-gray-700">Rep. Dom.</th>
                <th className="text-right py-3 px-3 font-semibold text-gray-700">Costa Rica</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-900 bg-primary-50">TOTAL PESOS</th>
              </tr>
            </thead>
            <tbody>
              {cuadroRows.map((row) => {
                const isTotal = row.mes === 'TOTAL'
                return (
                  <tr
                    key={row.mes}
                    className={`border-b border-gray-100 hover:bg-gray-50/50 ${isTotal ? 'bg-gray-100 font-semibold' : ''}`}
                  >
                    <td className="py-2 px-4 text-gray-900 sticky left-0 bg-white border-r border-gray-100 font-medium">
                      {row.mes}
                    </td>
                    <td className="text-right py-2 px-3 tabular-nums text-gray-700">{formatNum(row.colombia)}</td>
                    <td className="text-right py-2 px-3 tabular-nums text-gray-700">{formatNum(row.ecuador)}</td>
                    <td className="text-right py-2 px-3 tabular-nums text-gray-700">{formatNum(row.espana)}</td>
                    <td className="text-right py-2 px-3 tabular-nums text-gray-700">{formatNum(row.chile)}</td>
                    <td className="text-right py-2 px-3 tabular-nums text-gray-700">{formatNum(row.repDominicana)}</td>
                    <td className="text-right py-2 px-3 tabular-nums text-gray-700">{formatNum(row.costaRica)}</td>
                    <td className="text-right py-2 px-4 tabular-nums font-medium text-gray-900 bg-primary-50/30">
                      {row.totalPesos !== undefined ? formatNum(row.totalPesos) : '-'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Accesos rápidos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link to="/orders" className="card hover:shadow-lg transition-shadow flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <ShoppingBag className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Pedidos</h3>
            <p className="text-sm text-gray-500">{orders.length} pedidos</p>
          </div>
        </Link>
        <Link to="/contabilidad?tab=estado" className="card hover:shadow-lg transition-shadow flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
            <Calculator className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Estado de Resultados</h3>
            <p className="text-sm text-gray-500">Por país y mes</p>
          </div>
        </Link>
        <Link to="/analisis" className="card hover:shadow-lg transition-shadow flex items-center gap-4">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
            <BarChart3 className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Análisis de datos</h3>
            <p className="text-sm text-gray-500">Gráficas y tendencias</p>
          </div>
        </Link>
      </div>

      {/* Pedidos recientes (resumido) */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Pedidos Recientes</h2>
          <Link to="/orders" className="text-sm text-primary-600 hover:text-primary-700 font-medium">Ver todos →</Link>
        </div>
        <div className="space-y-2">
          {stats.recentOrders.slice(0, 5).map((order) => (
            <Link
              key={order.id}
              to={`/orders/${order.id}`}
              className="flex items-center justify-between py-3 px-4 rounded-lg hover:bg-gray-50 border border-gray-100"
            >
              <div>
                <p className="font-medium text-gray-900">#{order.orderNumber}</p>
                <p className="text-sm text-gray-500">{order.customerName} • {order.country}</p>
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
    </div>
  )
}
