import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  ShoppingBag,
  Calculator,
  BarChart3,
  FileSpreadsheet,
  Activity,
  RotateCcw,
  AlertCircle
} from 'lucide-react'
import { dashboardApi, ordersApi, accountingApi, DashboardStats, Order, Transaction as TransactionType } from '../services/api'
import { demoStorage, STORAGE_KEYS } from '../utils/storage'
import { format } from 'date-fns'

const COUNTRY_COLS = ['colombia', 'ecuador', 'espana', 'chile', 'repDominicana', 'costaRica'] as const

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

function formatNum(n: number) {
  return n.toLocaleString('es-ES', { maximumFractionDigits: 0 })
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [cuadro, setCuadro] = useState<CuadroGeneral | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  // Valores editables (KPIs)
  const [ventas, setVentas] = useState(0)
  const [gastos, setGastos] = useState(0)
  const [pedidos, setPedidos] = useState(0)

  // Tabla editable
  const [cuadroRows, setCuadroRows] = useState<CuadroRow[]>([])

  const loadAllData = useCallback(async () => {
    setLoadError(null)
    setLoading(true)
    try {
      const [statsRes, cuadroRes, ordersRes, transactionsRes] = await Promise.all([
        dashboardApi.getStats(),
        accountingApi.getCuadroGeneral(),
        ordersApi.getAll(),
        accountingApi.getTransactions()
      ])
      setStats(statsRes.data)
      setOrders(ordersRes.data)

      const totalRevenue = transactionsRes.data.filter((t: TransactionType) => t.type === 'sale').reduce((s: number, t: TransactionType) => s + t.baseCurrencyAmount, 0)
      const totalExpenses = transactionsRes.data.filter((t: TransactionType) => t.type === 'expense').reduce((s: number, t: TransactionType) => s + t.baseCurrencyAmount, 0)
      const apiCuadro = cuadroRes.data as CuadroGeneral
      const apiRows = apiCuadro.pesos?.rows ?? apiCuadro.rows ?? []

      // Cargar desde localStorage si existe (demo persistente)
      const storedKpis = demoStorage.get<{ ventas: number; gastos: number; pedidos: number }>(STORAGE_KEYS.DASHBOARD_KPIS)
      const storedCuadro = demoStorage.get<CuadroGeneral>(STORAGE_KEYS.CUADRO_GENERAL)

      if (storedCuadro?.pesos?.rows?.length) {
        setCuadro(storedCuadro)
        setCuadroRows(JSON.parse(JSON.stringify(storedCuadro.pesos!.rows)))
      } else {
        setCuadro(apiCuadro)
        setCuadroRows(JSON.parse(JSON.stringify(apiRows)))
      }

      if (storedKpis) {
        setVentas(storedKpis.ventas ?? totalRevenue)
        setGastos(storedKpis.gastos ?? totalExpenses)
        setPedidos(storedKpis.pedidos ?? statsRes.data.totalOrders)
      } else {
        setVentas(totalRevenue)
        setGastos(totalExpenses)
        setPedidos(statsRes.data.totalOrders)
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al cargar los datos'
      setLoadError(msg)
      console.error('Error loading data:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadAllData()
  }, [loadAllData])

  // Persistir en localStorage cuando el usuario edita
  useEffect(() => {
    if (!stats) return
    demoStorage.set(STORAGE_KEYS.DASHBOARD_KPIS, { ventas, gastos, pedidos })
  }, [ventas, gastos, pedidos, stats])

  useEffect(() => {
    if (!cuadro || cuadroRows.length === 0) return
    const toSave: CuadroGeneral = {
      ...cuadro,
      pesos: cuadro.pesos ? { ...cuadro.pesos, rows: cuadroRows } : { columns: [], rows: cuadroRows },
    }
    demoStorage.set(STORAGE_KEYS.CUADRO_GENERAL, toSave)
  }, [cuadro, cuadroRows])

  const recalcular = useCallback(() => {
    const monthRows = cuadroRows.filter((r) => r.mes !== 'TOTAL')
    const totalIdx = cuadroRows.findIndex((r) => r.mes === 'TOTAL')
    if (totalIdx < 0) return

    const next = JSON.parse(JSON.stringify(cuadroRows))
    monthRows.forEach((_, i) => {
      next[i].totalPesos = COUNTRY_COLS.reduce((s, c) => s + (next[i][c] || 0), 0)
    })
    COUNTRY_COLS.forEach((col) => {
      next[totalIdx][col] = monthRows.reduce((s, _, i) => s + (next[i][col] || 0), 0)
    })
    next[totalIdx].totalPesos = COUNTRY_COLS.reduce((s, c) => s + (next[totalIdx][c] || 0), 0)
    setCuadroRows(next)
  }, [cuadroRows])

  const handleCellChange = useCallback((rowIdx: number, col: (typeof COUNTRY_COLS)[number], value: number) => {
    setCuadroRows((prev) => {
      const next = JSON.parse(JSON.stringify(prev))
      if (next[rowIdx]?.mes === 'TOTAL') return prev
      next[rowIdx][col] = value
      return next
    })
  }, [])

  const utilidadNeta = ventas - gastos

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Cargando...</div>
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="flex items-center gap-3 text-amber-600">
          <AlertCircle size={32} />
          <h2 className="text-lg font-semibold">Error de conexión</h2>
        </div>
        <p className="text-gray-600 text-center max-w-md">
          No se pudieron cargar los datos. Verifica que el servidor esté en ejecución y vuelve a intentar.
        </p>
        <button
          type="button"
          onClick={loadAllData}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-600 text-white font-medium hover:bg-primary-700"
        >
          <RotateCcw size={18} />
          Reintentar
        </button>
      </div>
    )
  }

  if (!stats || !cuadro || cuadroRows.length === 0) return null

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Modo Excel — edita los valores y pulsa Calcular para actualizar totales</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={recalcular}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-600 text-white text-sm font-medium hover:bg-primary-700"
          >
            <Calculator size={18} />
            Calcular
          </button>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Activity className="w-4 h-4" />
            <span>Actualizado hace unos momentos</span>
          </div>
        </div>
      </div>

      {/* KPIs editables */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card py-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Ventas totales</p>
          <input
            type="text"
            value={ventas}
            onChange={(e) => setVentas(parseFloat(e.target.value.replace(/[^\d.]/g, '')) || 0)}
            className="text-xl font-bold text-gray-900 mt-1 w-full bg-transparent border-b border-transparent hover:border-gray-300 focus:border-primary-500 focus:outline-none py-1"
          />
        </div>
        <div className="card py-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Pedidos</p>
          <input
            type="text"
            value={pedidos}
            onChange={(e) => setPedidos(Number(e.target.value.replace(/\D/g, '')) || 0)}
            className="text-xl font-bold text-gray-900 mt-1 w-full bg-transparent border-b border-transparent hover:border-gray-300 focus:border-primary-500 focus:outline-none py-1"
          />
        </div>
        <div className="card py-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Gastos totales</p>
          <input
            type="text"
            value={gastos}
            onChange={(e) => setGastos(parseFloat(e.target.value.replace(/[^\d.]/g, '')) || 0)}
            className="text-xl font-bold text-gray-900 mt-1 w-full bg-transparent border-b border-transparent hover:border-gray-300 focus:border-primary-500 focus:outline-none py-1"
          />
        </div>
        <div className="card py-4 flex flex-col justify-center">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Utilidad neta (Ventas − Gastos)</p>
          <p className={`text-xl font-bold mt-1 ${utilidadNeta >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            ${formatNum(utilidadNeta)}
          </p>
          <Link to="/analisis" className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium text-sm mt-2">
            <BarChart3 size={18} />
            Ver análisis de datos
          </Link>
        </div>
      </div>

      {/* Cuadro General - tabla editable */}
      <div className="card overflow-hidden p-0">
        <div className="px-6 py-4 border-b border-gray-200 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-gray-900">{cuadro.title}</h2>
          <Link to="/contabilidad" className="text-sm text-primary-600 hover:text-primary-700 font-medium">Ver cuadro completo →</Link>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={recalcular}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-600 text-white text-sm font-medium hover:bg-primary-700"
            >
              <Calculator size={18} />
              Calcular
            </button>
            <Link
              to="/contabilidad?tab=estado"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50"
            >
              <FileSpreadsheet size={18} />
              Estado de Resultados
            </Link>
            <Link
              to="/analisis"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50"
            >
              <BarChart3 size={18} />
              Análisis
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
              {cuadroRows.map((row, rowIdx) => {
                const isTotal = row.mes === 'TOTAL'
                return (
                  <tr
                    key={row.mes}
                    className={`border-b border-gray-100 hover:bg-gray-50/50 ${isTotal ? 'bg-gray-100 font-semibold' : ''}`}
                  >
                    <td className="py-2 px-4 text-gray-900 sticky left-0 bg-white border-r border-gray-100 font-medium">
                      {row.mes}
                    </td>
                    {COUNTRY_COLS.map((col) => (
                      <td key={col} className="text-right py-1 px-2 tabular-nums text-gray-700">
                        {isTotal ? (
                          formatNum(row[col])
                        ) : (
                          <input
                            type="text"
                            value={row[col] ?? ''}
                            onChange={(e) => {
                              const v = e.target.value.replace(/,/g, '')
                              const num = v === '' ? 0 : parseFloat(v)
                              handleCellChange(rowIdx, col, isNaN(num) ? 0 : num)
                            }}
                            className="w-full min-w-[4rem] text-right py-1 px-2 rounded border border-transparent hover:border-gray-300 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 bg-transparent text-sm"
                          />
                        )}
                      </td>
                    ))}
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

      {/* Pedidos recientes */}
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
