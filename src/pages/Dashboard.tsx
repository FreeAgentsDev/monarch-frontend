import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  ShoppingBag,
  Calculator,
  BarChart3,
  FileSpreadsheet,
  RotateCcw,
  AlertCircle,
  Users,
  ArrowRight,
  Settings,
  Store,
  Pencil,
} from 'lucide-react'
import { dashboardApi, ordersApi, accountingApi, DashboardStats, Order, Transaction as TransactionType } from '../services/api'
import { demoStorage, STORAGE_KEYS } from '../utils/storage'
import { format } from 'date-fns'

const COUNTRY_COLS = ['colombia', 'ecuador', 'espana', 'chile', 'repDominicana', 'costaRica'] as const
const COUNTRY_LABELS: Record<string, string> = { colombia: 'CO', ecuador: 'EC', espana: 'ES', chile: 'CL', repDominicana: 'RD', costaRica: 'CR' }

interface CuadroRow { mes: string; colombia: number; ecuador: number; espana: number; chile: number; repDominicana: number; costaRica: number; totalPesos?: number }
interface CuadroBlock { columns: string[]; rows: CuadroRow[] }
interface CuadroGeneral { title: string; columns?: string[]; rows?: CuadroRow[]; pesos?: CuadroBlock; local?: CuadroBlock }

function formatNum(n: number) { return n.toLocaleString('es-ES', { maximumFractionDigits: 0 }) }

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [cuadro, setCuadro] = useState<CuadroGeneral | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [ventas, setVentas] = useState(0)
  const [gastos, setGastos] = useState(0)
  const [pedidos, setPedidos] = useState(0)
  const [cuadroRows, setCuadroRows] = useState<CuadroRow[]>([])

  const loadAllData = useCallback(async () => {
    setLoadError(null); setLoading(true)
    try {
      const [statsRes, cuadroRes, ordersRes, transactionsRes] = await Promise.all([
        dashboardApi.getStats(), accountingApi.getCuadroGeneral(), ordersApi.getAll(), accountingApi.getTransactions()
      ])
      setStats(statsRes.data); setOrders(ordersRes.data)
      const totalRevenue = transactionsRes.data.filter((t: TransactionType) => t.type === 'sale').reduce((s: number, t: TransactionType) => s + t.baseCurrencyAmount, 0)
      const totalExpenses = transactionsRes.data.filter((t: TransactionType) => t.type === 'expense').reduce((s: number, t: TransactionType) => s + t.baseCurrencyAmount, 0)
      const apiCuadro = cuadroRes.data as CuadroGeneral
      const apiRows = apiCuadro.pesos?.rows ?? apiCuadro.rows ?? []
      const storedKpis = demoStorage.get<{ ventas: number; gastos: number; pedidos: number }>(STORAGE_KEYS.DASHBOARD_KPIS)
      const storedCuadro = demoStorage.get<CuadroGeneral>(STORAGE_KEYS.CUADRO_GENERAL)
      if (storedCuadro?.pesos?.rows?.length) { setCuadro(storedCuadro); setCuadroRows(JSON.parse(JSON.stringify(storedCuadro.pesos!.rows))) }
      else { setCuadro(apiCuadro); setCuadroRows(JSON.parse(JSON.stringify(apiRows))) }
      if (storedKpis) { setVentas(storedKpis.ventas ?? totalRevenue); setGastos(storedKpis.gastos ?? totalExpenses); setPedidos(storedKpis.pedidos ?? statsRes.data.totalOrders) }
      else { setVentas(totalRevenue); setGastos(totalExpenses); setPedidos(statsRes.data.totalOrders) }
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Error al cargar los datos')
    } finally { setLoading(false) }
  }, [])

  useEffect(() => { loadAllData() }, [loadAllData])
  useEffect(() => { if (stats) demoStorage.set(STORAGE_KEYS.DASHBOARD_KPIS, { ventas, gastos, pedidos }) }, [ventas, gastos, pedidos, stats])
  useEffect(() => {
    if (!cuadro || cuadroRows.length === 0) return
    demoStorage.set(STORAGE_KEYS.CUADRO_GENERAL, { ...cuadro, pesos: cuadro.pesos ? { ...cuadro.pesos, rows: cuadroRows } : { columns: [], rows: cuadroRows } })
  }, [cuadro, cuadroRows])

  const recalcular = useCallback(() => {
    const monthRows = cuadroRows.filter((r) => r.mes !== 'TOTAL')
    const totalIdx = cuadroRows.findIndex((r) => r.mes === 'TOTAL')
    if (totalIdx < 0) return
    const next = JSON.parse(JSON.stringify(cuadroRows))
    monthRows.forEach((_, i) => { next[i].totalPesos = COUNTRY_COLS.reduce((s, c) => s + (next[i][c] || 0), 0) })
    COUNTRY_COLS.forEach((col) => { next[totalIdx][col] = monthRows.reduce((s, _, i) => s + (next[i][col] || 0), 0) })
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

  if (loading && !stats) return <div className="flex items-center justify-center h-64"><div className="animate-pulse text-gray-400">Cargando dashboard...</div></div>
  if (loadError) return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <AlertCircle size={40} className="text-amber-400" />
      <p className="text-gray-600 text-center max-w-md">No se pudieron cargar los datos.</p>
      <button type="button" onClick={loadAllData} className="btn-primary"><RotateCcw size={16} /> Reintentar</button>
    </div>
  )
  if (!stats || !cuadro || cuadroRows.length === 0) return null

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Vista general de Kevin Jewelry. Los valores son editables.</p>
        </div>
        <button type="button" onClick={recalcular} className="btn-primary">
          <Calculator size={16} /> Recalcular totales
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="kpi">
          <p className="kpi-label">Ventas totales</p>
          <div className="flex items-center gap-2">
            <span className="text-gray-400"><Pencil size={12} /></span>
            <input type="text" value={`$${formatNum(ventas)}`}
              onChange={(e) => setVentas(parseFloat(e.target.value.replace(/[^\d.]/g, '')) || 0)}
              className="kpi-value bg-transparent w-full focus:outline-none focus:text-primary-700 cursor-text" />
          </div>
        </div>
        <div className="kpi">
          <p className="kpi-label">Pedidos</p>
          <div className="flex items-center gap-2">
            <span className="text-gray-400"><Pencil size={12} /></span>
            <input type="text" value={pedidos}
              onChange={(e) => setPedidos(Number(e.target.value.replace(/\D/g, '')) || 0)}
              className="kpi-value bg-transparent w-full focus:outline-none focus:text-primary-700 cursor-text" />
          </div>
        </div>
        <div className="kpi">
          <p className="kpi-label">Gastos totales</p>
          <div className="flex items-center gap-2">
            <span className="text-gray-400"><Pencil size={12} /></span>
            <input type="text" value={`$${formatNum(gastos)}`}
              onChange={(e) => setGastos(parseFloat(e.target.value.replace(/[^\d.]/g, '')) || 0)}
              className="kpi-value bg-transparent w-full focus:outline-none focus:text-primary-700 cursor-text" />
          </div>
        </div>
        <div className="kpi bg-gradient-to-br from-white to-gray-50">
          <p className="kpi-label">Utilidad neta</p>
          <p className={`kpi-value ${utilidadNeta >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>${formatNum(utilidadNeta)}</p>
          <p className="kpi-sub">Ventas - Gastos</p>
        </div>
      </div>

      {/* Cuadro General */}
      <div className="card-flush">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-gray-900">{cuadro.title}</h2>
            <p className="text-xs text-gray-500 mt-0.5">Haz clic en una celda para editar. Pulsa "Recalcular" para actualizar totales.</p>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/contabilidad" className="btn-ghost text-xs"><FileSpreadsheet size={14} /> Contabilidad</Link>
            <Link to="/analisis" className="btn-ghost text-xs"><BarChart3 size={14} /> Analisis</Link>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-sm">
            <thead>
              <tr className="table-header">
                <th className="table-th sticky left-0 bg-gray-50/80 z-10 min-w-[100px]">Mes</th>
                {COUNTRY_COLS.map((col) => (
                  <th key={col} className="table-th text-right">{COUNTRY_LABELS[col]}</th>
                ))}
                <th className="table-th text-right bg-primary-50/60 font-bold">Total</th>
              </tr>
            </thead>
            <tbody>
              {cuadroRows.map((row, rowIdx) => {
                const isTotal = row.mes === 'TOTAL'
                return (
                  <tr key={row.mes} className={`${isTotal ? 'bg-gray-50 font-semibold' : 'table-row'}`}>
                    <td className="table-td font-medium text-gray-900 sticky left-0 bg-white z-[5] border-r border-gray-100">{row.mes}</td>
                    {COUNTRY_COLS.map((col) => (
                      <td key={col} className="text-right py-1 px-1.5 tabular-nums">
                        {isTotal ? (
                          <span className="px-2 py-1.5 text-sm font-semibold text-gray-900">{formatNum(row[col])}</span>
                        ) : (
                          <input type="text" value={row[col] ?? ''}
                            onChange={(e) => {
                              const v = e.target.value.replace(/,/g, '')
                              handleCellChange(rowIdx, col, v === '' ? 0 : (isNaN(parseFloat(v)) ? 0 : parseFloat(v)))
                            }}
                            className="w-full min-w-[3.5rem] text-right py-1.5 px-2 rounded-md border border-transparent text-sm text-gray-700 bg-transparent hover:bg-gray-50 hover:border-gray-200 focus:bg-white focus:border-primary-400 focus:ring-1 focus:ring-primary-400/30 focus:outline-none transition-all" />
                        )}
                      </td>
                    ))}
                    <td className="text-right py-2 px-4 tabular-nums font-semibold text-gray-900 bg-primary-50/30">
                      {row.totalPesos !== undefined ? formatNum(row.totalPesos) : '-'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Accesos rapidos + Red de socios */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { to: '/orders', icon: ShoppingBag, color: 'bg-blue-50 text-blue-600', label: 'Pedidos', sub: `${orders.length} pedidos` },
          { to: '/contabilidad', icon: FileSpreadsheet, color: 'bg-purple-50 text-purple-600', label: 'Contabilidad', sub: 'Cuadro y resultados' },
          { to: '/analisis', icon: BarChart3, color: 'bg-emerald-50 text-emerald-600', label: 'Analisis', sub: 'Graficas y tendencias' },
          { to: '/configuracion', icon: Settings, color: 'bg-amber-50 text-amber-600', label: 'Configuracion', sub: 'Usuarios y tasas' },
        ].map((item) => (
          <Link key={item.to} to={item.to} className="card flex items-center gap-4 hover:shadow-md hover:border-gray-300 transition-all group">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${item.color}`}>
              <item.icon size={20} />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-gray-900 text-sm group-hover:text-primary-700 transition-colors">{item.label}</p>
              <p className="text-xs text-gray-500 truncate">{item.sub}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Inversionistas + Empresarios */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center">
              <Users size={18} className="text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 text-sm">Inversionistas</h3>
          </div>
          <div className="space-y-2.5 mb-4">
            {[
              { label: 'Pedidos totales', value: String(orders.length) },
              { label: 'Paises con pedidos', value: String(new Set(orders.map((o) => o.countryCode)).size) },
              { label: 'Ticket promedio', value: `$${orders.length ? Math.round(orders.reduce((s, o) => s + o.totalAmount, 0) / orders.length) : 0}` },
            ].map((k) => (
              <div key={k.label} className="flex justify-between text-sm">
                <span className="text-gray-500">{k.label}</span>
                <span className="font-semibold text-gray-900 tabular-nums">{k.value}</span>
              </div>
            ))}
          </div>
          <Link to="/inversionistas" className="btn-ghost text-xs w-full justify-center">Ver inversionistas <ArrowRight size={14} /></Link>
        </div>
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center">
              <Store size={18} className="text-emerald-600" />
            </div>
            <h3 className="font-semibold text-gray-900 text-sm">Empresarios</h3>
          </div>
          <div className="space-y-2.5 mb-4">
            {[
              { label: 'Pedidos totales', value: String(orders.length) },
              { label: 'Ventas totales', value: `$${orders.reduce((s, o) => s + o.totalAmount, 0).toLocaleString('es-ES', { maximumFractionDigits: 0 })}` },
              { label: 'Paises activos', value: String(new Set(orders.map((o) => o.countryCode)).size) },
            ].map((k) => (
              <div key={k.label} className="flex justify-between text-sm">
                <span className="text-gray-500">{k.label}</span>
                <span className="font-semibold text-gray-900 tabular-nums">{k.value}</span>
              </div>
            ))}
          </div>
          <Link to="/empresarios" className="btn-ghost text-xs w-full justify-center">Ver empresarios <ArrowRight size={14} /></Link>
        </div>
      </div>

      {/* Pedidos recientes */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-900">Pedidos recientes</h2>
          <Link to="/orders" className="btn-ghost text-xs">Ver todos <ArrowRight size={14} /></Link>
        </div>
        <div className="space-y-1">
          {stats.recentOrders.slice(0, 5).map((order) => (
            <Link key={order.id} to={`/orders/${order.id}`}
              className="flex items-center justify-between py-3 px-4 -mx-1 rounded-lg hover:bg-gray-50 transition-colors group">
              <div>
                <p className="text-sm font-medium text-gray-900 group-hover:text-primary-700 transition-colors">#{order.orderNumber}</p>
                <p className="text-xs text-gray-500">{order.customerName} · {order.country}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900 tabular-nums">{order.currency} {order.totalAmount.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</p>
                <p className="text-xs text-gray-400">{format(new Date(order.createdAt), 'dd MMM')}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
