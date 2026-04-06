import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Package,
  Plus,
  Search,
  Eye,
  X,
  Pencil,
  Trash2,
  Save,
  FileText,
  Download,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { usePedidosEmpresario } from '../hooks/usePedidosEmpresario'
import type { PedidoEmpresario, PedidoEstadoType } from '../utils/storage'

const ESTADOS: { value: PedidoEstadoType; label: string; class: string }[] = [
  { value: 'pendiente', label: 'Pendiente', class: 'badge-gray' },
  { value: 'confirmado', label: 'Confirmado', class: 'badge-blue' },
  { value: 'enviado', label: 'Enviado', class: 'badge-amber' },
  { value: 'entregado', label: 'Entregado', class: 'badge-green' },
  { value: 'devolucion', label: 'Devolucion', class: 'badge-red' },
]

const ROLE_CONFIG = {
  empresario: { title: 'Mi Panel - Empresario', subtitle: 'Registra ventas, costos y controla tu rentabilidad.' },
  inversionista: { title: 'Mi Panel - Inversionista', subtitle: 'Registra pedidos y controla tus numeros.' },
} as const

type DraftPedido = Omit<PedidoEmpresario, 'id' | 'createdAt' | 'empresarioId'>

const EMPTY_DRAFT: DraftPedido = {
  fecha: new Date().toISOString().slice(0, 10), cliente: '', telefono: '', noPedido: '', noGuia: '',
  estado: 'pendiente', ventaJoyas: 0, comisionEnvio: 0, devolucion: 0, costoProducto: 0, costoEnvio: 0,
  moneda: 'USD', notas: '',
}

function fmt(n: number) { return n.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }

function utilidad(p: PedidoEmpresario | DraftPedido) {
  return p.ventaJoyas - p.comisionEnvio - p.devolucion - p.costoProducto - p.costoEnvio
}

function downloadCSV(pedidos: PedidoEmpresario[]) {
  const headers = ['Fecha', 'Cliente', 'Telefono', 'No. Pedido', 'No. Guia', 'Estado', 'Venta', 'Comision Envio', 'Devolucion', 'Costo Producto', 'Costo Envio', 'Utilidad', 'Moneda']
  const rows = pedidos.map((p) => [p.fecha, p.cliente, p.telefono, p.noPedido, p.noGuia, p.estado, p.ventaJoyas, p.comisionEnvio, p.devolucion, p.costoProducto, p.costoEnvio, utilidad(p).toFixed(2), p.moneda].join(','))
  const csv = '\uFEFF' + [headers.join(','), ...rows].join('\r\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = `pedidos_${new Date().toISOString().slice(0, 10)}.csv`; a.click()
  URL.revokeObjectURL(url)
}

export default function MiPanel() {
  const { role } = useAuth()
  const socioRole = (role === 'empresario' || role === 'inversionista') ? role : 'empresario'
  const config = ROLE_CONFIG[socioRole]
  // Use user id as empresarioId. Demo: map to e1 for empresario, e6 for inversionista
  const empresarioId = role === 'inversionista' ? 'inv_demo' : 'e1'

  const { add, update, remove, getByEmpresario, totales } = usePedidosEmpresario()
  const misPedidos = useMemo(() => getByEmpresario(empresarioId), [getByEmpresario, empresarioId])

  const [search, setSearch] = useState('')
  const [filterEstado, setFilterEstado] = useState<string>('all')
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draft, setDraft] = useState<DraftPedido>(EMPTY_DRAFT)
  const [detailId, setDetailId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    let list = misPedidos
    if (filterEstado !== 'all') list = list.filter((p) => p.estado === filterEstado)
    if (search.trim()) {
      const s = search.trim().toLowerCase()
      list = list.filter((p) =>
        p.cliente.toLowerCase().includes(s) ||
        p.noPedido.toLowerCase().includes(s) ||
        p.noGuia.toLowerCase().includes(s) ||
        p.telefono.includes(s)
      )
    }
    return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  }, [misPedidos, filterEstado, search])

  const t = totales(filtered)

  const startAdd = () => { setIsAdding(true); setEditingId(null); setDraft(EMPTY_DRAFT) }
  const startEdit = (p: PedidoEmpresario) => {
    setIsAdding(false); setEditingId(p.id)
    setDraft({ fecha: p.fecha, cliente: p.cliente, telefono: p.telefono, noPedido: p.noPedido, noGuia: p.noGuia, estado: p.estado, ventaJoyas: p.ventaJoyas, comisionEnvio: p.comisionEnvio, devolucion: p.devolucion, costoProducto: p.costoProducto, costoEnvio: p.costoEnvio, moneda: p.moneda, notas: p.notas })
  }
  const cancel = () => { setIsAdding(false); setEditingId(null) }
  const save = () => {
    if (!draft.cliente.trim()) return
    if (isAdding) { add({ ...draft, empresarioId }); setIsAdding(false) }
    else if (editingId) { update(editingId, draft); setEditingId(null) }
  }

  const detailPedido = detailId ? misPedidos.find((p) => p.id === detailId) : null

  const D = (field: keyof DraftPedido, value: string | number) => setDraft((d) => ({ ...d, [field]: value }))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">{config.title}</h1>
          <p className="page-subtitle">{config.subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          {filtered.length > 0 && (
            <button onClick={() => downloadCSV(filtered)} className="btn-secondary"><Download size={16} /> Exportar</button>
          )}
          <button onClick={startAdd} className="btn-primary"><Plus size={16} /> Nuevo pedido</button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="kpi">
          <p className="kpi-label">Pedidos</p>
          <p className="kpi-value">{t.count}</p>
        </div>
        <div className="kpi">
          <p className="kpi-label">Ventas</p>
          <p className="kpi-value text-emerald-600">${fmt(t.ventaJoyas)}</p>
        </div>
        <div className="kpi">
          <p className="kpi-label">Comision Envio</p>
          <p className="kpi-value text-amber-600">${fmt(t.comisionEnvio)}</p>
        </div>
        <div className="kpi">
          <p className="kpi-label">Costo Producto</p>
          <p className="kpi-value">${fmt(t.costoProducto)}</p>
        </div>
        <div className="kpi">
          <p className="kpi-label">Costo Envio</p>
          <p className="kpi-value">${fmt(t.costoEnvio)}</p>
        </div>
        <div className="kpi bg-gradient-to-br from-white to-gray-50">
          <p className="kpi-label">Utilidad</p>
          <p className={`kpi-value ${t.utilidad >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>${fmt(t.utilidad)}</p>
        </div>
      </div>

      {/* Quick access */}
      <div className="flex flex-wrap gap-3">
        {socioRole === 'empresario' && (
          <Link to="/mi-tienda" className="btn-secondary"><FileText size={16} /> Mi Tienda</Link>
        )}
        <Link to="/catalogo/EC" className="btn-secondary"><Package size={16} /> Catalogo</Link>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-[200px] max-w-md relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar cliente, pedido, guia..."
            className="input-search" />
        </div>
        <select value={filterEstado} onChange={(e) => setFilterEstado(e.target.value)} className="input w-auto">
          <option value="all">Todos los estados</option>
          {ESTADOS.map((e) => <option key={e.value} value={e.value}>{e.label}</option>)}
        </select>
      </div>

      {/* Form crear/editar */}
      {(isAdding || editingId) && (
        <div className="card bg-primary-50/50 border-primary-200">
          <h3 className="font-semibold text-gray-900 mb-4">{isAdding ? 'Registrar pedido' : 'Editar pedido'}</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Fecha</label>
              <input type="date" value={draft.fecha} onChange={(e) => D('fecha', e.target.value)} className="input text-sm" />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-medium text-gray-600 mb-1">Cliente *</label>
              <input type="text" value={draft.cliente} onChange={(e) => D('cliente', e.target.value)} className="input text-sm" placeholder="Nombre completo" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Telefono</label>
              <input type="text" value={draft.telefono} onChange={(e) => D('telefono', e.target.value)} className="input text-sm" placeholder="0981238828" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">No. Pedido</label>
              <input type="text" value={draft.noPedido} onChange={(e) => D('noPedido', e.target.value)} className="input text-sm" placeholder="1/ene 06" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">No. Guia</label>
              <input type="text" value={draft.noGuia} onChange={(e) => D('noGuia', e.target.value)} className="input text-sm" placeholder="LC49930275" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Estado</label>
              <select value={draft.estado} onChange={(e) => D('estado', e.target.value)} className="input text-sm">
                {ESTADOS.map((e) => <option key={e.value} value={e.value}>{e.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Moneda</label>
              <select value={draft.moneda} onChange={(e) => D('moneda', e.target.value)} className="input text-sm">
                <option>USD</option><option>COP</option><option>EUR</option>
              </select>
            </div>
          </div>

          <p className="section-label mt-4 mb-2">Desglose financiero</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Venta Joyas</label>
              <input type="number" step="0.01" min={0} value={draft.ventaJoyas || ''} onChange={(e) => D('ventaJoyas', Number(e.target.value))} className="input text-sm text-right" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Comision Envio</label>
              <input type="number" step="0.01" min={0} value={draft.comisionEnvio || ''} onChange={(e) => D('comisionEnvio', Number(e.target.value))} className="input text-sm text-right" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Devolucion</label>
              <input type="number" step="0.01" min={0} value={draft.devolucion || ''} onChange={(e) => D('devolucion', Number(e.target.value))} className="input text-sm text-right" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Costo Producto</label>
              <input type="number" step="0.01" min={0} value={draft.costoProducto || ''} onChange={(e) => D('costoProducto', Number(e.target.value))} className="input text-sm text-right" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Costo Envio</label>
              <input type="number" step="0.01" min={0} value={draft.costoEnvio || ''} onChange={(e) => D('costoEnvio', Number(e.target.value))} className="input text-sm text-right" />
            </div>
            <div className="flex flex-col justify-end">
              <label className="block text-xs font-medium text-gray-600 mb-1">Utilidad</label>
              <div className={`text-lg font-bold tabular-nums ${utilidad(draft) >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                ${fmt(utilidad(draft))}
              </div>
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <button onClick={save} className="btn-primary"><Save size={16} /> Guardar</button>
            <button onClick={cancel} className="btn-secondary"><X size={16} /> Cancelar</button>
          </div>
        </div>
      )}

      {/* Tabla de pedidos */}
      <div className="card-flush">
        <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
          <p className="text-sm text-gray-500">{filtered.length} pedido{filtered.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="table-header">
                <th className="table-th">Fecha</th>
                <th className="table-th">Cliente</th>
                <th className="table-th">Guia</th>
                <th className="table-th">Estado</th>
                <th className="table-th text-right">Venta</th>
                <th className="table-th text-right">Com. Envio</th>
                <th className="table-th text-right">Costo Prod.</th>
                <th className="table-th text-right">Costo Envio</th>
                <th className="table-th text-right">Utilidad</th>
                <th className="table-th text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => {
                const u = utilidad(p)
                const estadoMeta = ESTADOS.find((e) => e.value === p.estado) ?? ESTADOS[0]
                return (
                  <tr key={p.id} className="table-row">
                    <td className="table-td text-xs text-gray-500 whitespace-nowrap">{p.fecha}</td>
                    <td className="table-td">
                      <div className="font-medium text-gray-900 text-sm">{p.cliente}</div>
                      <div className="text-xs text-gray-400">{p.noPedido}</div>
                    </td>
                    <td className="table-td font-mono text-xs text-gray-600">{p.noGuia || '—'}</td>
                    <td className="table-td"><span className={estadoMeta.class}>{estadoMeta.label}</span></td>
                    <td className="table-td text-right tabular-nums font-medium text-gray-900">{fmt(p.ventaJoyas)}</td>
                    <td className="table-td text-right tabular-nums text-gray-600">{fmt(p.comisionEnvio)}</td>
                    <td className="table-td text-right tabular-nums text-gray-600">{fmt(p.costoProducto)}</td>
                    <td className="table-td text-right tabular-nums text-gray-600">{fmt(p.costoEnvio)}</td>
                    <td className={`table-td text-right tabular-nums font-semibold ${u >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{fmt(u)}</td>
                    <td className="table-td text-right">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => setDetailId(p.id)} className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg"><Eye size={14} /></button>
                        <button onClick={() => startEdit(p)} className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg"><Pencil size={14} /></button>
                        <button onClick={() => { if (window.confirm('Eliminar este pedido?')) remove(p.id) }} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={10} className="table-td text-center py-12 text-gray-400">
                  No hay pedidos registrados. Usa "Nuevo pedido" para empezar.
                </td></tr>
              )}
            </tbody>
            {filtered.length > 0 && (
              <tfoot>
                <tr className="bg-gray-50 font-semibold">
                  <td className="table-td" colSpan={4}>TOTALES</td>
                  <td className="table-td text-right tabular-nums text-gray-900">{fmt(t.ventaJoyas)}</td>
                  <td className="table-td text-right tabular-nums text-gray-600">{fmt(t.comisionEnvio)}</td>
                  <td className="table-td text-right tabular-nums text-gray-600">{fmt(t.costoProducto)}</td>
                  <td className="table-td text-right tabular-nums text-gray-600">{fmt(t.costoEnvio)}</td>
                  <td className={`table-td text-right tabular-nums ${t.utilidad >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{fmt(t.utilidad)}</td>
                  <td className="table-td"></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* Detail modal */}
      {detailPedido && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30 p-4" onClick={() => setDetailId(null)}>
          <div className="w-full max-w-lg bg-white rounded-xl shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Pedido {detailPedido.noPedido}</p>
                <p className="font-semibold text-gray-900">{detailPedido.cliente}</p>
              </div>
              <button onClick={() => setDetailId(null)} className="p-2 hover:bg-gray-100 rounded-lg"><X size={16} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-gray-500">Fecha:</span> <span className="text-gray-900 font-medium">{detailPedido.fecha}</span></div>
                <div><span className="text-gray-500">Telefono:</span> <span className="text-gray-900">{detailPedido.telefono}</span></div>
                <div><span className="text-gray-500">No. Guia:</span> <span className="text-gray-900 font-mono">{detailPedido.noGuia || '—'}</span></div>
                <div><span className="text-gray-500">Estado:</span> <span className={ESTADOS.find((e) => e.value === detailPedido.estado)?.class}>{ESTADOS.find((e) => e.value === detailPedido.estado)?.label}</span></div>
              </div>
              <div className="border-t border-gray-100 pt-4">
                <p className="section-label mb-3">Desglose financiero ({detailPedido.moneda})</p>
                <div className="space-y-2 text-sm">
                  {[
                    { label: 'Venta Joyas', value: detailPedido.ventaJoyas, color: 'text-gray-900' },
                    { label: 'Comision Envio', value: -detailPedido.comisionEnvio, color: 'text-amber-600' },
                    { label: 'Devolucion', value: -detailPedido.devolucion, color: 'text-red-600' },
                    { label: 'Costo Producto', value: -detailPedido.costoProducto, color: 'text-gray-600' },
                    { label: 'Costo Envio', value: -detailPedido.costoEnvio, color: 'text-gray-600' },
                  ].map((r) => (
                    <div key={r.label} className="flex justify-between">
                      <span className="text-gray-500">{r.label}</span>
                      <span className={`font-medium tabular-nums ${r.color}`}>{r.value < 0 ? '-' : ''}${fmt(Math.abs(r.value))}</span>
                    </div>
                  ))}
                  <div className="flex justify-between pt-2 border-t border-gray-200 font-semibold">
                    <span>Utilidad</span>
                    <span className={`tabular-nums ${utilidad(detailPedido) >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>${fmt(utilidad(detailPedido))}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
