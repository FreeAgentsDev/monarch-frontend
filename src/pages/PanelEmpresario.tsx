import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  Package,
  Plus,
  FileText,
  Truck,
  Search,
  Filter,
  Eye,
  ChevronDown,
  X,
  Calendar,
} from 'lucide-react'
import { ordersApi, accountingApi } from '../services/api'
import type { Order, OrderItem } from '../services/api'
import { format } from 'date-fns'
import { useAuth } from '../context/AuthContext'

type TabId = 'historial' | 'crear' | 'contabilidad' | 'transportadoras'

type PedidoEstado =
  | 'pendiente_confirmacion'
  | 'confirmado'
  | 'devolucion'
  | 'no_entregado'
  | 'entregado'

const ESTADOS: { value: PedidoEstado; label: string; class: string }[] = [
  { value: 'pendiente_confirmacion', label: 'Pendiente confirmación', class: 'bg-gray-100 text-gray-800 border border-gray-300' },
  { value: 'confirmado', label: 'Confirmado', class: 'bg-blue-100 text-blue-800 border border-blue-300' },
  { value: 'devolucion', label: 'Devolución', class: 'bg-red-100 text-red-800 border border-red-300' },
  { value: 'no_entregado', label: 'No entregado', class: 'bg-amber-100 text-amber-800 border border-amber-300' },
  { value: 'entregado', label: 'Entregado', class: 'bg-green-100 text-green-800 border border-green-300' },
]

function apiStatusToEstado(api: Order['status']): PedidoEstado {
  const map: Record<Order['status'], PedidoEstado> = {
    pending: 'pendiente_confirmacion',
    processing: 'confirmado',
    shipped: 'confirmado',
    delivered: 'entregado',
    cancelled: 'devolucion',
  }
  return map[api] ?? 'pendiente_confirmacion'
}

const TABS: { id: TabId; label: string; icon: typeof Package }[] = [
  { id: 'historial', label: 'Mis pedidos', icon: Package },
  { id: 'crear', label: 'Crear pedido', icon: Plus },
  { id: 'contabilidad', label: 'Resumen (demo)', icon: FileText },
  { id: 'transportadoras', label: 'Transportadoras', icon: Truck },
]

const TRANSPORTADORAS = [
  { nombre: 'Servientrega', pais: 'Ecuador', servicio: 'Estándar', url: '#' },
  { nombre: 'DHL', pais: 'Ecuador', servicio: 'Express', url: '#' },
  { nombre: 'Coordinadora', pais: 'Colombia', servicio: 'Estándar', url: '#' },
]

const VALID_TABS: TabId[] = ['historial', 'crear', 'contabilidad', 'transportadoras']

function tabFromSearchParams(searchParams: URLSearchParams): TabId | null {
  const t = searchParams.get('tab')
  return t && VALID_TABS.includes(t as TabId) ? (t as TabId) : null
}

export default function PanelEmpresario() {
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const [activeTab, setActiveTab] = useState<TabId>(() => tabFromSearchParams(searchParams) ?? 'historial')
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [estadoOverrides, setEstadoOverrides] = useState<Record<string, PedidoEstado>>({})
  const [search, setSearch] = useState('')
  const [filterEstado, setFilterEstado] = useState<string>('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [manageOrderId, setManageOrderId] = useState<string | null>(null)
  const [manageEstado, setManageEstado] = useState<PedidoEstado>('pendiente_confirmacion')
  const [transactions, setTransactions] = useState<any[]>([])
  const [nuevoPedido, setNuevoPedido] = useState({
    cliente: user?.name ?? '',
    direccion: '',
    pais: 'Ecuador',
    producto: '',
    cantidad: 1,
    observaciones: '',
    moneda: 'USD',
  })

  useEffect(() => {
    const next = tabFromSearchParams(searchParams)
    if (next) setActiveTab(next)
  }, [searchParams])

  useEffect(() => {
    ordersApi
      .getAll()
      .then((r) => setOrders(r.data))
      .catch(console.error)
      .finally(() => setLoading(false))
    accountingApi.getTransactions().then((r) => setTransactions(r.data)).catch(() => setTransactions([]))
  }, [])

  const getOrderEstado = (order: Order): PedidoEstado => estadoOverrides[order.id] ?? apiStatusToEstado(order.status)

  const ownOrders = useMemo(() => {
    // Demo: si no hay match por usuario, dejamos la lista completa.
    const email = user?.email?.toLowerCase().trim()
    const name = user?.name?.toLowerCase().trim()
    if (!email && !name) return orders
    const filtered = orders.filter((o) => {
      const e = (o.customerEmail || '').toLowerCase()
      const n = (o.customerName || '').toLowerCase()
      return (email && e.includes(email)) || (name && n.includes(name))
    })
    return filtered.length ? filtered : orders
  }, [orders, user?.email, user?.name])

  const getNextOrderNumber = (): string => {
    const year = new Date().getFullYear()
    const prefix = `EMP-${year}-`
    const nums = ownOrders
      .map((o) => (o.orderNumber || '').replace('#', ''))
      .filter((n) => n.startsWith(prefix))
      .map((n) => parseInt(n.replace(prefix, ''), 10) || 0)
    const next = nums.length ? Math.max(...nums) + 1 : 1
    return `#${prefix}${String(next).padStart(3, '0')}`
  }

  const handleCrearPedido = (e: React.FormEvent) => {
    e.preventDefault()
    const orderNumber = getNextOrderNumber()
    const now = new Date().toISOString()
    const id = `emp_${Date.now()}`
    const cantidad = Math.max(1, nuevoPedido.cantidad)
    const precioUnitario = 100
    const totalAmount = precioUnitario * cantidad
    const newOrder: Order = {
      id,
      shopifyOrderId: '',
      shopifyStoreId: 'empresario',
      storeName: 'Panel Empresario',
      orderNumber,
      customerEmail: user?.email ?? '',
      customerName: nuevoPedido.cliente.trim() || user?.name || 'Empresario',
      totalAmount,
      currency: nuevoPedido.moneda,
      status: 'pending',
      countryCode: nuevoPedido.pais === 'Colombia' ? 'CO' : 'EC',
      country: nuevoPedido.pais,
      createdAt: now,
      updatedAt: now,
      items: [
        {
          id: `item_${Date.now()}`,
          productId: '',
          variantId: '',
          sku: nuevoPedido.producto || 'N/A',
          title: nuevoPedido.producto || 'Producto',
          quantity: cantidad,
          price: precioUnitario,
          total: totalAmount,
        },
      ],
    }
    setOrders((prev) => [newOrder, ...prev])
    setEstadoOverrides((prev) => ({ ...prev, [id]: 'pendiente_confirmacion' }))
    setNuevoPedido({
      cliente: user?.name ?? '',
      direccion: '',
      pais: 'Ecuador',
      producto: '',
      cantidad: 1,
      observaciones: '',
      moneda: 'USD',
    })
    setActiveTab('historial')
  }

  const filteredOrders = ownOrders.filter((order) => {
    const estado = getOrderEstado(order)
    const searchLower = search.trim().toLowerCase()
    const matchesSearch =
      !searchLower ||
      order.customerName?.toLowerCase().includes(searchLower) ||
      order.orderNumber?.toLowerCase().includes(searchLower) ||
      order.customerEmail?.toLowerCase().includes(searchLower) ||
      order.country?.toLowerCase().includes(searchLower) ||
      order.items?.some(
        (i: OrderItem) => i.title?.toLowerCase().includes(searchLower) || i.sku?.toLowerCase().includes(searchLower)
      )
    const matchesEstado = filterEstado === 'all' || estado === filterEstado
    const orderDate = order.createdAt ? new Date(order.createdAt).getTime() : 0
    const fromOk = !dateFrom || orderDate >= new Date(dateFrom).getTime()
    const toOk = !dateTo || orderDate <= new Date(dateTo + 'T23:59:59').getTime()
    return matchesSearch && matchesEstado && fromOk && toOk
  })

  const handleSaveEstado = () => {
    if (manageOrderId) {
      setEstadoOverrides((prev) => ({ ...prev, [manageOrderId]: manageEstado }))
      setManageOrderId(null)
    }
  }

  const orderForManage = manageOrderId ? ownOrders.find((o) => o.id === manageOrderId) : null

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-gradient-to-r from-white via-primary-50/30 to-indigo-50/40">
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">Panel profesional del empresario</h1>
              <p className="mt-1 text-sm text-gray-500 max-w-xl">
                Controla pedidos, rendimiento y logística con una interfaz ejecutiva enfocada en conversión.
              </p>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <div className="hidden sm:flex items-center gap-2 rounded-xl bg-gray-100 px-4 py-2.5">
                <Package size={20} className="text-gray-500" />
                <span className="text-sm font-semibold text-gray-700">
                  {ownOrders.length} pedido{ownOrders.length !== 1 ? 's' : ''}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('crear')}
                className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-700 transition-colors"
              >
                <Plus size={20} />
                Nuevo pedido
              </button>
            </div>
          </div>
        </div>

        <div className="px-4 sm:px-6 lg:px-8">
          <nav className="flex gap-1 overflow-x-auto -mb-px scrollbar-hide" aria-label="Secciones del panel">
            {TABS.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`inline-flex items-center gap-2 px-4 py-3.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                    isActive
                      ? 'border-primary-600 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon size={18} />
                  {tab.label}
                </button>
              )
            })}
          </nav>
        </div>
      </header>

      <main className="px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'historial' && (
          <div className="space-y-6">
            <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm" aria-labelledby="filtros-heading">
              <h2 id="filtros-heading" className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-1 flex items-center gap-2">
                <Filter size={18} />
                Filtros y búsqueda
              </h2>
              <p className="text-sm text-gray-500 mb-4">Busca por cliente, número o producto y filtra por estado o rango de fechas.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="relative lg:col-span-2">
                  <label htmlFor="search-orders" className="sr-only">Buscar pedidos</label>
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    id="search-orders"
                    type="text"
                    placeholder="Cliente, número, país, producto..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                  <select
                    value={filterEstado}
                    onChange={(e) => setFilterEstado(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-white py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                  >
                    <option value="all">Todos</option>
                    {ESTADOS.map((e) => (
                      <option key={e.value} value={e.value}>{e.label}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Desde</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="date"
                        value={dateFrom}
                        onChange={(e) => setDateFrom(e.target.value)}
                        className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Hasta</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="date"
                        value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)}
                        className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Pedidos</h2>
                  <p className="text-sm text-gray-500">Empresario: {user?.name ?? '—'} · {filteredOrders.length} resultado(s)</p>
                </div>
              </div>

              {loading ? (
                <div className="py-12 text-center text-gray-500">Cargando pedidos...</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50">
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Nº</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Cliente</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">País</th>
                        <th className="text-right py-3 px-4 font-medium text-gray-700">Total</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Estado</th>
                        <th className="text-right py-3 px-4 font-medium text-gray-700">Acción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrders.map((o) => {
                        const estado = getOrderEstado(o)
                        const estadoMeta = ESTADOS.find((e) => e.value === estado) ?? ESTADOS[0]
                        return (
                          <tr key={o.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                            <td className="py-3 px-4 font-medium text-gray-900">{o.orderNumber}</td>
                            <td className="py-3 px-4 text-gray-600">{o.customerName}</td>
                            <td className="py-3 px-4 text-gray-600">{o.country}</td>
                            <td className="py-3 px-4 text-right font-medium">{o.totalAmount} {o.currency}</td>
                            <td className="py-3 px-4">
                              <span className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium ${estadoMeta.class}`}>
                                {estadoMeta.label}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <button
                                type="button"
                                onClick={() => {
                                  setManageOrderId(o.id)
                                  setManageEstado(estado)
                                }}
                                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-gray-700 text-sm hover:bg-gray-50"
                              >
                                <Eye size={16} />
                                Ver / gestionar
                              </button>
                            </td>
                          </tr>
                        )
                      })}
                      {!filteredOrders.length && (
                        <tr>
                          <td colSpan={6} className="py-10 text-center text-gray-500">No hay pedidos para los filtros seleccionados.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </div>
        )}

        {activeTab === 'crear' && (
          <div className="max-w-3xl">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-1">Crear pedido</h2>
              <p className="text-sm text-gray-500 mb-6">
                Crea un pedido rápido. (Demo: se guarda localmente en esta sesión)
              </p>
              <form onSubmit={handleCrearPedido} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
                  <input
                    value={nuevoPedido.cliente}
                    onChange={(e) => setNuevoPedido((p) => ({ ...p, cliente: e.target.value }))}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                  <input
                    value={nuevoPedido.direccion}
                    onChange={(e) => setNuevoPedido((p) => ({ ...p, direccion: e.target.value }))}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">País</label>
                  <select
                    value={nuevoPedido.pais}
                    onChange={(e) => setNuevoPedido((p) => ({ ...p, pais: e.target.value }))}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                  >
                    <option>Ecuador</option>
                    <option>Colombia</option>
                    <option>España</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Moneda</label>
                  <select
                    value={nuevoPedido.moneda}
                    onChange={(e) => setNuevoPedido((p) => ({ ...p, moneda: e.target.value }))}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                  >
                    <option>USD</option>
                    <option>COP</option>
                    <option>EUR</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Producto</label>
                  <input
                    value={nuevoPedido.producto}
                    onChange={(e) => setNuevoPedido((p) => ({ ...p, producto: e.target.value }))}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                    placeholder="SKU o nombre"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad</label>
                  <input
                    type="number"
                    min={1}
                    value={nuevoPedido.cantidad}
                    onChange={(e) => setNuevoPedido((p) => ({ ...p, cantidad: Number(e.target.value) }))}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones</label>
                  <input
                    value={nuevoPedido.observaciones}
                    onChange={(e) => setNuevoPedido((p) => ({ ...p, observaciones: e.target.value }))}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                    placeholder="Opcional"
                  />
                </div>
                <div className="sm:col-span-2 flex items-center justify-between mt-2">
                  <Link to="/empresarios/pedidos" className="text-sm text-gray-600 hover:text-gray-900 hover:underline">
                    Ver “Mis pedidos”
                  </Link>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-700"
                  >
                    <Plus size={18} />
                    Crear pedido
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {activeTab === 'contabilidad' && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-1">Resumen de actividad (demo)</h2>
              <p className="text-sm text-gray-500">
                Vista de resultados para el empresario: ventas, devoluciones y gastos (en demo se muestra data general).
              </p>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900">Transacciones recientes</h3>
                <p className="text-sm text-gray-500">Total: {transactions.length}</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Fecha</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Descripción</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-700">Monto</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Moneda</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.slice(0, 15).map((t: any) => (
                      <tr key={t.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                        <td className="py-3 px-4 text-gray-600">{t.date ? format(new Date(t.date), 'yyyy-MM-dd') : '—'}</td>
                        <td className="py-3 px-4 text-gray-900">{t.description}</td>
                        <td className="py-3 px-4 text-right font-medium">{t.amount}</td>
                        <td className="py-3 px-4 text-gray-600">{t.currency}</td>
                      </tr>
                    ))}
                    {!transactions.length && (
                      <tr>
                        <td colSpan={4} className="py-10 text-center text-gray-500">No hay transacciones.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'transportadoras' && (
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Transportadoras</h2>
              <p className="text-sm text-gray-500">Enlaces útiles para gestión de guías y seguimiento.</p>
            </div>
            <div className="divide-y divide-gray-100">
              {TRANSPORTADORAS.map((t) => (
                <div key={t.nombre} className="px-5 py-4 flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">{t.nombre}</div>
                    <div className="text-sm text-gray-500">{t.pais} · {t.servicio}</div>
                  </div>
                  <a
                    href={t.url}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-gray-700 text-sm hover:bg-gray-50"
                  >
                    Ir
                    <ChevronDown size={16} className="-rotate-90" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {orderForManage && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4" onClick={() => setManageOrderId(null)}>
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500">Pedido</div>
                <div className="text-lg font-semibold text-gray-900">{orderForManage.orderNumber}</div>
              </div>
              <button
                type="button"
                onClick={() => setManageOrderId(null)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-gray-100"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-gray-500">Cliente</div>
                  <div className="font-medium text-gray-900">{orderForManage.customerName}</div>
                </div>
                <div>
                  <div className="text-gray-500">Fecha</div>
                  <div className="font-medium text-gray-900">
                    {orderForManage.createdAt ? format(new Date(orderForManage.createdAt), 'yyyy-MM-dd') : '—'}
                  </div>
                </div>
                <div>
                  <div className="text-gray-500">Total</div>
                  <div className="font-medium text-gray-900">{orderForManage.totalAmount} {orderForManage.currency}</div>
                </div>
                <div>
                  <div className="text-gray-500">País</div>
                  <div className="font-medium text-gray-900">{orderForManage.country}</div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                <select
                  value={manageEstado}
                  onChange={(e) => setManageEstado(e.target.value as PedidoEstado)}
                  className="w-full rounded-xl border border-gray-200 bg-white py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                >
                  {ESTADOS.map((e) => (
                    <option key={e.value} value={e.value}>{e.label}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setManageOrderId(null)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-gray-700 text-sm hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSaveEstado}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-600 text-white text-sm font-medium hover:bg-primary-700"
                >
                  Guardar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

