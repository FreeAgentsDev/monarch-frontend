import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Store,
  MapPin,
  Plus,
  Pencil,
  Trash2,
  Save,
  X,
  Search,
} from 'lucide-react'
import { useEmpresarios } from '../hooks/useEmpresarios'
import { usePedidosEmpresario } from '../hooks/usePedidosEmpresario'
import { usePaises } from '../hooks/usePaisesInversionistas'
import type { Empresario } from '../utils/storage'
import { isValidEmail, inputErrorClass } from '../utils/formValidation'

function fmt(n: number) { return n.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }

const EMPTY_DRAFT: Omit<Empresario, 'id' | 'createdAt' | 'updatedAt'> = {
  nombre: '', marca: '', email: '', telefono: '', paisCodigo: 'CO', activo: true, notas: '',
}

export default function Empresarios() {
  const { empresarios, add, update, remove } = useEmpresarios()
  const { getByEmpresario, totales } = usePedidosEmpresario()
  const { paises } = usePaises()
  const [filterPais, setFilterPais] = useState<string>('all')
  const [search, setSearch] = useState('')
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draft, setDraft] = useState(EMPTY_DRAFT)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    let list = empresarios
    if (filterPais !== 'all') list = list.filter((e) => e.paisCodigo === filterPais)
    if (search.trim()) {
      const s = search.trim().toLowerCase()
      list = list.filter((e) =>
        e.nombre.toLowerCase().includes(s) ||
        e.marca.toLowerCase().includes(s) ||
        e.email.toLowerCase().includes(s)
      )
    }
    return list
  }, [empresarios, filterPais, search])

  const paisesConEmpresarios = useMemo(() => {
    const counts: Record<string, number> = {}
    empresarios.forEach((e) => { counts[e.paisCodigo] = (counts[e.paisCodigo] || 0) + 1 })
    return counts
  }, [empresarios])

  const totalVentas = useMemo(() => {
    return filtered.reduce((acc, e) => acc + totales(getByEmpresario(e.id)).ventaJoyas, 0)
  }, [filtered, totales, getByEmpresario])

  const totalPedidos = useMemo(() => {
    return filtered.reduce((acc, e) => acc + getByEmpresario(e.id).length, 0)
  }, [filtered, getByEmpresario])

  const startAdd = () => {
    setIsAdding(true); setEditingId(null); setErrors({}); setDraft(EMPTY_DRAFT)
  }
  const startEdit = (e: Empresario) => {
    setIsAdding(false); setEditingId(e.id); setErrors({})
    setDraft({ nombre: e.nombre, marca: e.marca, email: e.email, telefono: e.telefono ?? '', paisCodigo: e.paisCodigo, activo: e.activo, notas: e.notas ?? '' })
  }
  const cancel = () => { setIsAdding(false); setEditingId(null); setErrors({}) }

  const save = () => {
    const err: Record<string, string> = {}
    if (!draft.nombre.trim()) err.nombre = 'Obligatorio'
    if (!draft.marca.trim()) err.marca = 'Obligatorio'
    if (!draft.email.trim()) err.email = 'Obligatorio'
    else if (!isValidEmail(draft.email)) err.email = 'Email invalido'
    if (!draft.paisCodigo) err.paisCodigo = 'Selecciona un pais'
    setErrors(err)
    if (Object.keys(err).length) return

    const data = { ...draft, telefono: draft.telefono?.trim() || undefined, notas: draft.notas?.trim() || undefined }
    if (isAdding) { add(data); setIsAdding(false) }
    else if (editingId) { update(editingId, data); setEditingId(null) }
    setErrors({})
  }

  const getPaisNombre = (codigo: string) => paises.find((p) => p.codigo === codigo)?.nombre ?? codigo

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Empresarios</h1>
          <p className="page-subtitle">Marcas independientes que usan inventario Kevin Jewelry.</p>
        </div>
        <button onClick={startAdd} className="btn-primary"><Plus size={16} /> Nuevo empresario</button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="kpi">
          <p className="kpi-label">Empresarios</p>
          <p className="kpi-value">{filtered.length}</p>
          <p className="kpi-sub">{empresarios.filter((e) => e.activo).length} activos</p>
        </div>
        <div className="kpi">
          <p className="kpi-label">Paises</p>
          <p className="kpi-value">{Object.keys(paisesConEmpresarios).length}</p>
        </div>
        <div className="kpi">
          <p className="kpi-label">Pedidos totales</p>
          <p className="kpi-value">{totalPedidos}</p>
        </div>
        <div className="kpi">
          <p className="kpi-label">Ventas (USD)</p>
          <p className="kpi-value text-emerald-600">${totalVentas.toLocaleString('es-ES')}</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="card">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Buscar</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Nombre, marca o email..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Pais</label>
            <select
              value={filterPais}
              onChange={(e) => setFilterPais(e.target.value)}
              className="rounded-lg border border-gray-200 bg-white py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            >
              <option value="all">Todos los paises</option>
              {paises.filter((p) => p.activo).map((p) => (
                <option key={p.id} value={p.codigo}>{p.nombre} ({paisesConEmpresarios[p.codigo] || 0})</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Form agregar/editar */}
      {(isAdding || editingId) && (
        <div className="card bg-primary-50/50 border-primary-200">
          <h3 className="font-semibold text-gray-900 mb-4">{isAdding ? 'Nuevo empresario' : 'Editar empresario'}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
              <input type="text" value={draft.nombre} onChange={(e) => { setDraft((d) => ({ ...d, nombre: e.target.value })); setErrors((er) => ({ ...er, nombre: '' })) }} className={`input ${inputErrorClass(!!errors.nombre)}`} placeholder="Maria Gomez" />
              {errors.nombre && <p className="text-xs text-red-600 mt-1">{errors.nombre}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Marca / Tienda</label>
              <input type="text" value={draft.marca} onChange={(e) => { setDraft((d) => ({ ...d, marca: e.target.value })); setErrors((er) => ({ ...er, marca: '' })) }} className={`input ${inputErrorClass(!!errors.marca)}`} placeholder="Juacho Jewelry" />
              {errors.marca && <p className="text-xs text-red-600 mt-1">{errors.marca}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" value={draft.email} onChange={(e) => { setDraft((d) => ({ ...d, email: e.target.value })); setErrors((er) => ({ ...er, email: '' })) }} className={`input ${inputErrorClass(!!errors.email)}`} placeholder="maria@marca.com" />
              {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pais</label>
              <select value={draft.paisCodigo} onChange={(e) => setDraft((d) => ({ ...d, paisCodigo: e.target.value }))} className={`input ${inputErrorClass(!!errors.paisCodigo)}`}>
                <option value="">Seleccionar</option>
                {paises.filter((p) => p.activo).map((p) => <option key={p.id} value={p.codigo}>{p.nombre}</option>)}
              </select>
              {errors.paisCodigo && <p className="text-xs text-red-600 mt-1">{errors.paisCodigo}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Telefono</label>
              <input type="text" value={draft.telefono ?? ''} onChange={(e) => setDraft((d) => ({ ...d, telefono: e.target.value }))} className="input" />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={draft.activo} onChange={(e) => setDraft((d) => ({ ...d, activo: e.target.checked }))} className="rounded border-gray-300" />
                <span className="text-sm text-gray-700">Activo</span>
              </label>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={save} className="btn-primary inline-flex items-center gap-2"><Save size={16} /> Guardar</button>
            <button onClick={cancel} className="btn-secondary inline-flex items-center gap-2"><X size={16} /> Cancelar</button>
          </div>
        </div>
      )}

      {/* Lista de empresarios */}
      <div className="space-y-3">
        {filtered.map((emp) => {
          const pedidosEmp = getByEmpresario(emp.id)
          const t = totales(pedidosEmp)
          const expanded = expandedId === emp.id
          return (
            <div key={emp.id} className={`card-flush ${!emp.activo ? 'opacity-60' : ''}`}>
              <div
                className="px-5 py-4 flex items-center gap-4 cursor-pointer hover:bg-gray-50/50 transition-colors"
                onClick={() => setExpandedId(expanded ? null : emp.id)}
              >
                <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center shrink-0">
                  <Store size={20} className="text-primary-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900 truncate">{emp.marca}</h3>
                    {!emp.activo && <span className="badge-gray">Inactivo</span>}
                  </div>
                  <p className="text-sm text-gray-500 truncate">{emp.nombre} · {getPaisNombre(emp.paisCodigo)}</p>
                </div>
                <div className="hidden sm:flex items-center gap-6 text-sm">
                  <div className="text-right">
                    <p className="text-gray-500">Pedidos</p>
                    <p className="font-semibold text-gray-900">{t.count}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-500">Ventas</p>
                    <p className="font-semibold text-emerald-600">${fmt(t.ventaJoyas)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-500">Utilidad</p>
                    <p className={`font-semibold ${t.utilidad >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>${fmt(t.utilidad)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={(e) => { e.stopPropagation(); startEdit(emp) }} className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg"><Pencil size={16} /></button>
                  <button onClick={(e) => { e.stopPropagation(); if (window.confirm(`Eliminar "${emp.marca}"?`)) remove(emp.id) }} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
                </div>
              </div>

              {expanded && (
                <div className="border-t border-gray-100">
                  {/* Resumen financiero */}
                  <div className="px-5 py-3 bg-gray-50/80 grid grid-cols-2 sm:grid-cols-6 gap-3 text-xs">
                    <div><span className="text-gray-500">Ventas</span><p className="font-semibold text-gray-900">${fmt(t.ventaJoyas)}</p></div>
                    <div><span className="text-gray-500">Com. Envio</span><p className="font-semibold text-amber-600">${fmt(t.comisionEnvio)}</p></div>
                    <div><span className="text-gray-500">Devoluciones</span><p className="font-semibold text-red-600">${fmt(t.devolucion)}</p></div>
                    <div><span className="text-gray-500">Costo Producto</span><p className="font-semibold text-gray-700">${fmt(t.costoProducto)}</p></div>
                    <div><span className="text-gray-500">Costo Envio</span><p className="font-semibold text-gray-700">${fmt(t.costoEnvio)}</p></div>
                    <div><span className="text-gray-500">Utilidad</span><p className={`font-bold ${t.utilidad >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>${fmt(t.utilidad)}</p></div>
                  </div>

                  {/* Tabla de pedidos */}
                  {pedidosEmp.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[700px] text-xs">
                        <thead>
                          <tr className="table-header">
                            <th className="py-2 px-3 text-left text-xs font-semibold uppercase text-gray-500">Fecha</th>
                            <th className="py-2 px-3 text-left text-xs font-semibold uppercase text-gray-500">Cliente</th>
                            <th className="py-2 px-3 text-left text-xs font-semibold uppercase text-gray-500">Guia</th>
                            <th className="py-2 px-3 text-left text-xs font-semibold uppercase text-gray-500">Estado</th>
                            <th className="py-2 px-3 text-right text-xs font-semibold uppercase text-gray-500">Venta</th>
                            <th className="py-2 px-3 text-right text-xs font-semibold uppercase text-gray-500">Costo</th>
                            <th className="py-2 px-3 text-right text-xs font-semibold uppercase text-gray-500">Utilidad</th>
                          </tr>
                        </thead>
                        <tbody>
                          {pedidosEmp.sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map((p) => {
                            const u = p.ventaJoyas - p.comisionEnvio - p.devolucion - p.costoProducto - p.costoEnvio
                            return (
                              <tr key={p.id} className="table-row">
                                <td className="py-2 px-3 text-gray-500">{p.fecha}</td>
                                <td className="py-2 px-3 text-gray-900 font-medium">{p.cliente}</td>
                                <td className="py-2 px-3 text-gray-500 font-mono">{p.noGuia || '—'}</td>
                                <td className="py-2 px-3"><span className={`badge text-[10px] ${p.estado === 'entregado' ? 'badge-green' : p.estado === 'enviado' ? 'badge-amber' : p.estado === 'devolucion' ? 'badge-red' : 'badge-gray'}`}>{p.estado}</span></td>
                                <td className="py-2 px-3 text-right tabular-nums font-medium">{fmt(p.ventaJoyas)}</td>
                                <td className="py-2 px-3 text-right tabular-nums text-gray-500">{fmt(p.costoProducto + p.costoEnvio)}</td>
                                <td className={`py-2 px-3 text-right tabular-nums font-semibold ${u >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{fmt(u)}</td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="px-5 py-6 text-center text-xs text-gray-400">Sin pedidos registrados.</div>
                  )}

                  {/* Info + links */}
                  <div className="px-5 py-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                      <span>{emp.email}</span>
                      <span>{emp.telefono || ''}</span>
                      <span>{getPaisNombre(emp.paisCodigo)}</span>
                    </div>
                    <Link to={`/catalogo/${emp.paisCodigo}`} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gray-100 text-gray-700 text-xs font-medium hover:bg-gray-200">
                      <MapPin size={12} /> Catalogo
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )
        })}
        {filtered.length === 0 && (
          <div className="card text-center py-12 text-gray-500">
            No hay empresarios{filterPais !== 'all' ? ` en ${getPaisNombre(filterPais)}` : ''}.
          </div>
        )}
      </div>
    </div>
  )
}
