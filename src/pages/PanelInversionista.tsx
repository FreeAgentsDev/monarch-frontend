import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
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

type TabId = 'historial' | 'crear' | 'contabilidad' | 'transportadoras'

export type PedidoEstado =
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
  { id: 'historial', label: 'Historial de pedidos', icon: Package },
  { id: 'crear', label: 'Crear pedido', icon: Plus },
  { id: 'contabilidad', label: 'Vista contabilidad', icon: FileText },
  { id: 'transportadoras', label: 'Vista transportadoras', icon: Truck },
]

const TRANSPORTADORAS = [
  { nombre: 'Servientrega', pais: 'Ecuador', servicio: 'Estándar', url: '#' },
  { nombre: 'DHL', pais: 'Ecuador', servicio: 'Express', url: '#' },
  { nombre: 'Coordinadora', pais: 'Colombia', servicio: 'Estándar', url: '#' },
]

export default function PanelInversionista() {
  const [activeTab, setActiveTab] = useState<TabId>('historial')
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
    cliente: '',
    direccion: '',
    pais: 'España',
    producto: '',
    cantidad: 1,
    observaciones: '',
    moneda: 'EUR',
  })

  useEffect(() => {
    ordersApi.getAll().then((r) => setOrders(r.data)).catch(console.error).finally(() => setLoading(false))
    accountingApi.getTransactions().then((r) => setTransactions(r.data)).catch(() => setTransactions([]))
  }, [])

  const getOrderEstado = (order: Order): PedidoEstado =>
    estadoOverrides[order.id] ?? apiStatusToEstado(order.status)

  const getNextOrderNumber = (): string => {
    const year = new Date().getFullYear()
    const prefix = `ORD-${year}-`
    const nums = orders
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
    const id = `local_${Date.now()}`
    const cantidad = Math.max(1, nuevoPedido.cantidad)
    const precioUnitario = 100
    const totalAmount = precioUnitario * cantidad
    const newOrder: Order = {
      id,
      shopifyOrderId: '',
      shopifyStoreId: 'panel',
      storeName: 'Panel Inversionista',
      orderNumber,
      customerEmail: '',
      customerName: nuevoPedido.cliente.trim() || 'Sin nombre',
      totalAmount,
      currency: nuevoPedido.moneda,
      status: 'pending',
      countryCode: nuevoPedido.pais === 'España' ? 'ES' : 'EC',
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
      cliente: '',
      direccion: '',
      pais: 'España',
      producto: '',
      cantidad: 1,
      observaciones: '',
      moneda: 'EUR',
    })
    setActiveTab('historial')
  }

  const filteredOrders = orders.filter((order) => {
    const estado = getOrderEstado(order)
    const searchLower = search.trim().toLowerCase()
    const matchesSearch =
      !searchLower ||
      order.customerName?.toLowerCase().includes(searchLower) ||
      order.orderNumber?.toLowerCase().includes(searchLower) ||
      order.customerEmail?.toLowerCase().includes(searchLower) ||
      order.country?.toLowerCase().includes(searchLower) ||
      order.items?.some(
        (i: OrderItem) =>
          i.title?.toLowerCase().includes(searchLower) || i.sku?.toLowerCase().includes(searchLower)
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

  const orderForManage = manageOrderId ? orders.find((o) => o.id === manageOrderId) : null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header profesional */}
      <header className="border-b border-gray-200 bg-gradient-to-r from-white via-amber-50/30 to-orange-50/40">
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
                Panel profesional del inversionista
              </h1>
              <p className="mt-1 text-sm text-gray-500 max-w-xl">
                Supervisa pedidos, utilidad y seguimiento operativo desde una experiencia más clara y ejecutiva.
              </p>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <div className="hidden sm:flex items-center gap-2 rounded-xl bg-gray-100 px-4 py-2.5">
                <Package size={20} className="text-gray-500" />
                <span className="text-sm font-semibold text-gray-700">{orders.length} pedido{orders.length !== 1 ? 's' : ''}</span>
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

        {/* Navegación por pestañas */}
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
        {/* Tab: Historial de pedidos */}
        {activeTab === 'historial' && (
          <div className="space-y-6">
            {/* Bloque: Filtros y búsqueda */}
            <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm" aria-labelledby="filtros-heading">
              <h2 id="filtros-heading" className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-1 flex items-center gap-2">
                <Filter size={18} />
                Filtros y búsqueda
              </h2>
              <p className="text-sm text-gray-500 mb-4">Busca por cliente, ID o producto y filtra por estado o rango de fechas.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="relative lg:col-span-2">
                  <label htmlFor="search-orders" className="sr-only">Buscar pedidos</label>
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    id="search-orders"
                    type="text"
                    placeholder="Nombre, ID, dirección, producto..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label htmlFor="filter-estado" className="sr-only">Estado del pedido</label>
                  <select
                    id="filter-estado"
                    value={filterEstado}
                    onChange={(e) => setFilterEstado(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                  >
                    <option value="all">Todos los estados</option>
                    {ESTADOS.map((e) => (
                      <option key={e.value} value={e.value}>
                        {e.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={18} className="text-gray-400 shrink-0" aria-hidden />
                  <label htmlFor="date-from" className="sr-only">Desde</label>
                  <input
                    id="date-from"
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="flex-1 min-w-0 px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  />
                  <span className="text-gray-400 text-sm" aria-hidden>–</span>
                  <label htmlFor="date-to" className="sr-only">Hasta</label>
                  <input
                    id="date-to"
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="flex-1 min-w-0 px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  />
                </div>
              </div>
            </section>

            {/* Tabla de pedidos */}
            <section className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden" aria-labelledby="resultados-heading">
              <div className="px-5 py-4 border-b border-gray-100 bg-gray-50 flex flex-wrap items-center justify-between gap-2">
                <p id="resultados-heading" className="text-sm font-medium text-gray-600">
                  <span className="font-semibold text-gray-900">{filteredOrders.length}</span> pedido{filteredOrders.length !== 1 ? 's' : ''} encontrado{filteredOrders.length !== 1 ? 's' : ''}
                </p>
                <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                  <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-gray-400" /> Pendiente</span>
                  <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500" /> Confirmado</span>
                  <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500" /> Entregado</span>
                  <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" /> No entregado</span>
                  <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" /> Devolución</span>
                </div>
              </div>
              {loading ? (
                <div className="py-16 text-center">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-gray-600" />
                  <p className="mt-3 text-sm text-gray-500">Cargando pedidos...</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50">
                        <th className="text-left py-4 px-5 font-semibold text-gray-600">ID / Pedido</th>
                        <th className="text-left py-4 px-5 font-semibold text-gray-600">Cliente</th>
                        <th className="text-left py-4 px-5 font-semibold text-gray-600">Dirección / País</th>
                        <th className="text-left py-4 px-5 font-semibold text-gray-600">Productos</th>
                        <th className="text-right py-4 px-5 font-semibold text-gray-600">Total</th>
                        <th className="text-left py-4 px-5 font-semibold text-gray-600">Estado</th>
                        <th className="text-left py-4 px-5 font-semibold text-gray-600">Fecha</th>
                        <th className="text-right py-4 px-5 font-semibold text-gray-600">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredOrders.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="py-16 px-6">
                            <div className="text-center max-w-sm mx-auto">
                              <Package className="mx-auto text-gray-300" size={48} />
                              <p className="mt-3 font-medium text-gray-700">No hay pedidos que coincidan</p>
                              <p className="mt-1 text-sm text-gray-500">Prueba a cambiar los filtros o crea un nuevo pedido.</p>
                              <button
                                type="button"
                                onClick={() => setActiveTab('crear')}
                                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-700"
                              >
                                <Plus size={18} />
                                Crear pedido
                              </button>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        filteredOrders.map((order) => {
                          const estado = getOrderEstado(order)
                          const estadoInfo = ESTADOS.find((e) => e.value === estado)
                          return (
                            <tr key={order.id} className="bg-white hover:bg-gray-50/80 transition-colors">
                              <td className="py-4 px-5 font-semibold text-gray-900">{order.orderNumber}</td>
                              <td className="py-4 px-5 text-gray-700">{order.customerName}</td>
                              <td className="py-4 px-5 text-gray-600">{order.country}</td>
                              <td className="py-4 px-5 text-gray-600">
                                {order.items?.length ?? 0} producto{(order.items?.length ?? 0) !== 1 ? 's' : ''}
                              </td>
                              <td className="py-4 px-5 text-right font-semibold text-gray-900">
                                {order.currency} {order.totalAmount.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                              </td>
                              <td className="py-4 px-5">
                                <span
                                  className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-semibold ${estadoInfo?.class ?? 'bg-gray-100 text-gray-700'}`}
                                >
                                  {estadoInfo?.label ?? estado}
                                </span>
                              </td>
                              <td className="py-4 px-5 text-gray-600">
                                {order.createdAt
                                  ? format(new Date(order.createdAt), 'dd/MM/yyyy')
                                  : '—'}
                              </td>
                              <td className="py-4 px-5 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <Link
                                    to={`/orders/${order.id}`}
                                    className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-gray-600 hover:bg-gray-100 hover:text-gray-900 font-medium transition-colors"
                                  >
                                    <Eye size={16} />
                                    Ver
                                  </Link>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setManageOrderId(order.id)
                                      setManageEstado(getOrderEstado(order))
                                    }}
                                    className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-gray-600 hover:bg-gray-100 hover:text-gray-900 font-medium transition-colors"
                                  >
                                    <ChevronDown size={16} />
                                    Gestionar
                                  </button>
                                </div>
                              </td>
                            </tr>
                          )
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </div>
        )}

        {/* Tab: Crear pedido */}
        {activeTab === 'crear' && (
          <div className="max-w-2xl">
            <section className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden" aria-labelledby="crear-pedido-heading">
              <div className="px-6 py-5 border-b border-gray-100 bg-gray-50">
                <h2 id="crear-pedido-heading" className="text-lg font-semibold text-gray-900">Crear pedido</h2>
                <p className="mt-0.5 text-sm text-gray-500">Rellena los datos del cliente, envío y productos. El pedido aparecerá en el historial con estado &quot;Pendiente confirmación&quot;.</p>
              </div>
              <form className="p-6 space-y-5" onSubmit={handleCrearPedido}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="sm:col-span-2 pt-2 border-t border-gray-100">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Datos del cliente</p>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Cliente</label>
                    <input
                      type="text"
                      placeholder="Nombre del cliente"
                      value={nuevoPedido.cliente}
                      onChange={(e) => setNuevoPedido((p) => ({ ...p, cliente: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Dirección de envío</label>
                    <input
                      type="text"
                      placeholder="Dirección completa"
                      value={nuevoPedido.direccion}
                      onChange={(e) => setNuevoPedido((p) => ({ ...p, direccion: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300"
                    />
                  </div>
                  <div className="sm:col-span-2 pt-2 border-t border-gray-100">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Envío y productos</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">País</label>
                    <select
                      value={nuevoPedido.pais}
                      onChange={(e) => setNuevoPedido((p) => ({ ...p, pais: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300"
                    >
                      <option value="España">España</option>
                      <option value="Ecuador">Ecuador</option>
                      <option value="Colombia">Colombia</option>
                      <option value="Estados Unidos">Estados Unidos</option>
                      <option value="Chile">Chile</option>
                      <option value="México">México</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Producto (nombre o SKU)</label>
                    <input
                      type="text"
                      placeholder="Ej. MON-001"
                      value={nuevoPedido.producto}
                      onChange={(e) => setNuevoPedido((p) => ({ ...p, producto: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Cantidad</label>
                    <input
                      type="number"
                      min={1}
                      value={nuevoPedido.cantidad}
                      onChange={(e) => setNuevoPedido((p) => ({ ...p, cantidad: parseInt(e.target.value, 10) || 1 }))}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Observaciones</label>
                    <textarea
                      rows={2}
                      placeholder="Opcional"
                      value={nuevoPedido.observaciones}
                      onChange={(e) => setNuevoPedido((p) => ({ ...p, observaciones: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 resize-none"
                    />
                  </div>
                </div>
                <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-100">
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-700 transition-colors"
                  >
                    <Plus size={18} />
                    Crear pedido
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('historial')}
                    className="inline-flex items-center rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </section>
          </div>
        )}

        {/* Tab: Vista contabilidad */}
        {activeTab === 'contabilidad' && (
          <div className="space-y-6">
            <section className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden" aria-labelledby="contabilidad-heading">
              <div className="px-6 py-5 border-b border-gray-100 bg-gray-50">
                <h2 id="contabilidad-heading" className="text-lg font-semibold text-gray-900">Vista contabilidad</h2>
                <p className="mt-0.5 text-sm text-gray-500">
                  Resumen de ingresos, reembolsos y transacciones asociados a los pedidos. Para el detalle completo usa el enlace inferior.
                </p>
              </div>
              <div className="p-6">
                <p className="text-sm font-medium text-gray-600 mb-4">Resumen actual</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Ingresos (mes)</p>
                    <p className="mt-2 text-2xl font-bold text-gray-900">
                      ${(transactions.filter((t) => t.type === 'sale').reduce((s, t) => s + (t.amount || 0), 0)).toLocaleString('es-ES')}
                    </p>
                  </div>
                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Reembolsos</p>
                    <p className="mt-2 text-2xl font-bold text-gray-900">
                      ${(transactions.filter((t) => t.type === 'refund').reduce((s, t) => s + Math.abs(t.amount || 0), 0)).toLocaleString('es-ES')}
                    </p>
                  </div>
                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Transacciones</p>
                    <p className="mt-2 text-2xl font-bold text-gray-900">{transactions.length}</p>
                  </div>
                </div>
                <Link
                  to="/contabilidad"
                  className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <FileText size={18} />
                  Ir a Contabilidad completa
                </Link>
              </div>
            </section>
          </div>
        )}

        {/* Tab: Vista transportadoras */}
        {activeTab === 'transportadoras' && (
          <section className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden" aria-labelledby="transportadoras-heading">
            <div className="px-6 py-5 border-b border-gray-100 bg-gray-50">
              <h2 id="transportadoras-heading" className="text-lg font-semibold text-gray-900">Vista transportadoras</h2>
              <p className="mt-0.5 text-sm text-gray-500">Usa los enlaces para rastrear envíos según la transportadora y el país.</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left py-4 px-6 font-semibold text-gray-600">Transportadora</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-600">País</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-600">Servicio</th>
                    <th className="text-right py-4 px-6 font-semibold text-gray-600">Enlace</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {TRANSPORTADORAS.map((t, i) => (
                    <tr key={i} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-4 px-6 font-medium text-gray-900">{t.nombre}</td>
                      <td className="py-4 px-6 text-gray-600">{t.pais}</td>
                      <td className="py-4 px-6 text-gray-600">{t.servicio}</td>
                      <td className="py-4 px-6 text-right">
                        <a
                          href={t.url}
                          className="inline-flex items-center rounded-lg px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                          Rastrear
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Modal: Gestionar estado del pedido */}
        {manageOrderId && orderForManage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="modal-gestionar-title">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 max-w-md w-full overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                <h3 id="modal-gestionar-title" className="text-lg font-semibold text-gray-900">
                  Gestionar pedido {orderForManage.orderNumber}
                </h3>
                <button
                  type="button"
                  onClick={() => setManageOrderId(null)}
                  className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                  aria-label="Cerrar"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-6">
                <p className="text-sm text-gray-600 mb-3">Cambia el estado del pedido para reflejar su situación actual (confirmado, enviado, entregado, etc.).</p>
                <label htmlFor="select-estado-pedido" className="block text-sm font-medium text-gray-700 mb-2">Nuevo estado</label>
                <select
                  id="select-estado-pedido"
                  value={manageEstado}
                  onChange={(e) => setManageEstado(e.target.value as PedidoEstado)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 mb-5"
                >
                  {ESTADOS.map((e) => (
                    <option key={e.value} value={e.value}>
                      {e.label}
                    </option>
                  ))}
                </select>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleSaveEstado}
                    className="flex-1 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 transition-colors"
                  >
                    Guardar
                  </button>
                  <button
                    type="button"
                    onClick={() => setManageOrderId(null)}
                    className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
