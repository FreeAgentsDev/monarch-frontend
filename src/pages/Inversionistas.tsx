import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Users,
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  Store,
  Link2,
  Search,
} from 'lucide-react'
import { useInversionistas, useInversionistaTiendas, usePaises } from '../hooks/usePaisesInversionistas'
import { shopifyApi } from '../services/api'
import type { Shop } from '../services/api'
import type { Inversionista } from '../utils/storage'
import { isValidEmail, isValidCountryCode, inputErrorClass } from '../utils/formValidation'

/** Demo: ventas simuladas por inversionista */
function getDemoVentas(id: string) {
  const seed = id.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  return {
    pedidos: 5 + (seed % 30),
    ventasUSD: 2000 + (seed % 8) * 1100,
    ultimoPedido: new Date(Date.now() - (seed % 20) * 86400000).toLocaleDateString('es-ES'),
  }
}

export default function Inversionistas() {
  const { inversionistas, add, update, remove } = useInversionistas()
  const { add: addEnlace, remove: removeEnlace, getByInversionista } = useInversionistaTiendas()
  const { paises } = usePaises()
  const [shops, setShops] = useState<Shop[]>([])
  const [search, setSearch] = useState('')

  // CRUD state
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [form, setForm] = useState<Partial<Inversionista>>({ nombre: '', email: '', telefono: '', activo: true })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  // Detalle / enlaces
  const [detalleId, setDetalleId] = useState<string | null>(null)
  const [nuevoEnlace, setNuevoEnlace] = useState<{ paisCodigo: string; shopId: string } | null>(null)
  const [enlaceError, setEnlaceError] = useState<string | null>(null)

  useEffect(() => { shopifyApi.getShops().then((r) => setShops(r.data)).catch(console.error) }, [])

  const filtered = useMemo(() => {
    if (!search.trim()) return inversionistas
    const s = search.trim().toLowerCase()
    return inversionistas.filter((i) =>
      i.nombre.toLowerCase().includes(s) || i.email.toLowerCase().includes(s)
    )
  }, [inversionistas, search])

  const totalVentas = useMemo(() => filtered.reduce((acc, i) => acc + getDemoVentas(i.id).ventasUSD, 0), [filtered])
  const totalPedidos = useMemo(() => filtered.reduce((acc, i) => acc + getDemoVentas(i.id).pedidos, 0), [filtered])

  const handleSave = () => {
    const err: Record<string, string> = {}
    if (!form.nombre?.trim()) err.nombre = 'Obligatorio'
    if (!form.email?.trim()) err.email = 'Obligatorio'
    else if (!isValidEmail(form.email)) err.email = 'Email invalido'
    setFormErrors(err)
    if (Object.keys(err).length) return
    if (isAdding) {
      add({ nombre: form.nombre!.trim(), email: form.email!.trim(), telefono: form.telefono, activo: form.activo ?? true, notas: form.notas })
      setForm({ nombre: '', email: '', telefono: '', activo: true }); setFormErrors({}); setIsAdding(false)
    } else if (editingId) {
      update(editingId, { nombre: form.nombre!.trim(), email: form.email!.trim(), telefono: form.telefono, activo: form.activo, notas: form.notas })
      setEditingId(null); setFormErrors({})
    }
  }
  const handleEdit = (inv: Inversionista) => { setForm({ nombre: inv.nombre, email: inv.email, telefono: inv.telefono, activo: inv.activo, notas: inv.notas }); setEditingId(inv.id); setIsAdding(false); setFormErrors({}) }
  const handleCancel = () => { setEditingId(null); setIsAdding(false); setFormErrors({}); setForm({ nombre: '', email: '', telefono: '', activo: true }) }
  const handleDelete = (inv: Inversionista) => { if (window.confirm(`Eliminar "${inv.nombre}"?`)) { getByInversionista(inv.id).forEach((e) => removeEnlace(e.id)); remove(inv.id) } }

  const handleAddEnlace = () => {
    if (!detalleId || !nuevoEnlace?.paisCodigo || !nuevoEnlace?.shopId) { setEnlaceError('Selecciona pais y tienda.'); return }
    if (!isValidCountryCode(nuevoEnlace.paisCodigo)) { setEnlaceError('Codigo de pais invalido.'); return }
    setEnlaceError(null)
    const shop = shops.find((s) => s.id === nuevoEnlace!.shopId)
    addEnlace({ inversionistaId: detalleId, paisCodigo: nuevoEnlace.paisCodigo, shopId: nuevoEnlace.shopId, storeName: shop?.shopifyStoreName, activo: true })
    setNuevoEnlace(null)
  }
  const shopsPorPais = (codigo: string) => shops.filter((s) => s.countryCode === codigo)
  const invDetalle = detalleId ? inversionistas.find((i) => i.id === detalleId) : null
  const enlacesDelInv = invDetalle ? getByInversionista(invDetalle.id) : []

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Inversionistas</h1>
          <p className="page-subtitle">Revendedores bajo la marca Kevin Jewelry.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/catalogo/EC" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50">
            <Store size={18} /> Ver catalogo
          </Link>
          <button onClick={() => { setIsAdding(true); setEditingId(null); setForm({ nombre: '', email: '', telefono: '', activo: true }); setFormErrors({}) }} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-600 text-white font-medium hover:bg-primary-700">
            <Plus size={18} /> Nuevo inversionista
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="kpi">
          <p className="kpi-label">Inversionistas</p>
          <p className="kpi-value">{filtered.length}</p>
          <p className="kpi-sub">{inversionistas.filter((i) => i.activo).length} activos</p>
        </div>
        <div className="kpi">
          <p className="kpi-label">Tiendas vinculadas</p>
          <p className="kpi-value">{inversionistas.reduce((acc, i) => acc + getByInversionista(i.id).length, 0)}</p>
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

      {/* Buscar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por nombre o email..." className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500" />
      </div>

      {/* Form */}
      {(isAdding || editingId) && (
        <div className="card bg-primary-50/50 border-primary-200">
          <h3 className="font-semibold text-gray-900 mb-4">{isAdding ? 'Nuevo inversionista' : 'Editar inversionista'}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
              <input type="text" value={form.nombre || ''} onChange={(e) => { setForm((f) => ({ ...f, nombre: e.target.value })); setFormErrors((er) => ({ ...er, nombre: '' })) }} className={`input ${inputErrorClass(!!formErrors.nombre)}`} />
              {formErrors.nombre && <p className="text-xs text-red-600 mt-1">{formErrors.nombre}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" value={form.email || ''} onChange={(e) => { setForm((f) => ({ ...f, email: e.target.value })); setFormErrors((er) => ({ ...er, email: '' })) }} className={`input ${inputErrorClass(!!formErrors.email)}`} />
              {formErrors.email && <p className="text-xs text-red-600 mt-1">{formErrors.email}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Telefono</label>
              <input type="text" value={form.telefono || ''} onChange={(e) => setForm((f) => ({ ...f, telefono: e.target.value }))} className="input" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
              <input type="text" value={form.notas || ''} onChange={(e) => setForm((f) => ({ ...f, notas: e.target.value }))} className="input" />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.activo ?? true} onChange={(e) => setForm((f) => ({ ...f, activo: e.target.checked }))} className="rounded border-gray-300" />
                <span className="text-sm text-gray-700">Activo</span>
              </label>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={handleSave} className="btn-primary inline-flex items-center gap-2"><Check size={16} /> Guardar</button>
            <button onClick={handleCancel} className="btn-secondary inline-flex items-center gap-2"><X size={16} /> Cancelar</button>
          </div>
        </div>
      )}

      {/* Lista */}
      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left py-3 px-4 font-medium text-gray-700">Inversionista</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Email</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Estado</th>
                <th className="text-right py-3 px-4 font-medium text-gray-700">Tiendas</th>
                <th className="text-right py-3 px-4 font-medium text-gray-700">Pedidos</th>
                <th className="text-right py-3 px-4 font-medium text-gray-700">Ventas</th>
                <th className="text-right py-3 px-4 font-medium text-gray-700">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((inv) => {
                const count = getByInversionista(inv.id).length
                const v = getDemoVentas(inv.id)
                return (
                  <tr key={inv.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Users size={18} className="text-gray-400" />
                        <span className="font-medium text-gray-900">{inv.nombre}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{inv.email}</td>
                    <td className="py-3 px-4">
                      <span className={inv.activo ? 'badge-green' : 'badge-amber'}>{inv.activo ? 'Activo' : 'Inactivo'}</span>
                    </td>
                    <td className="py-3 px-4 text-right text-gray-600">{count}</td>
                    <td className="py-3 px-4 text-right font-medium text-gray-900">{v.pedidos}</td>
                    <td className="py-3 px-4 text-right font-medium text-green-600">${v.ventasUSD.toLocaleString('es-ES')}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => { setDetalleId(inv.id); setNuevoEnlace(null) }} className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg" title="Tiendas"><Link2 size={16} /></button>
                        <button onClick={() => handleEdit(inv)} className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg" title="Editar"><Pencil size={16} /></button>
                        <button onClick={() => handleDelete(inv)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg" title="Eliminar"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && <div className="py-12 text-center text-gray-500">No hay inversionistas.</div>}
      </div>

      {/* Modal tiendas */}
      {detalleId && invDetalle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="card max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Tiendas de {invDetalle.nombre}</h2>
              <button onClick={() => { setDetalleId(null); setNuevoEnlace(null) }} className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"><X size={20} /></button>
            </div>
            <p className="text-sm text-gray-600 mb-4">Vincula tiendas Shopify por pais</p>
            <div className="space-y-3">
              {enlacesDelInv.map((e) => {
                const paisItem = paises.find((p) => p.codigo === e.paisCodigo)
                const shop = shops.find((s) => s.id === e.shopId)
                return (
                  <div key={e.id} className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Store size={20} className="text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900">{shop?.shopifyStoreName || e.storeName || 'Sin nombre'}</p>
                        <p className="text-sm text-gray-500">{paisItem?.nombre || e.paisCodigo}</p>
                      </div>
                    </div>
                    <button onClick={() => removeEnlace(e.id)} className="text-red-600 hover:text-red-700 text-sm font-medium">Desvincular</button>
                  </div>
                )
              })}
              {enlacesDelInv.length === 0 && <p className="text-sm text-gray-500 py-4 text-center">Sin tiendas vinculadas.</p>}
            </div>
            {nuevoEnlace ? (
              <div className="mt-4 p-4 bg-primary-50 rounded-lg space-y-3">
                <h4 className="font-medium text-gray-900">Nueva vinculacion</h4>
                {enlaceError && <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{enlaceError}</p>}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pais</label>
                    <select value={nuevoEnlace.paisCodigo} onChange={(e) => { setEnlaceError(null); setNuevoEnlace((n) => ({ ...n!, paisCodigo: e.target.value, shopId: '' })) }} className="input">
                      <option value="">Seleccionar</option>
                      {paises.filter((p) => p.activo).map((p) => <option key={p.id} value={p.codigo}>{p.nombre}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tienda Shopify</label>
                    <select value={nuevoEnlace.shopId} onChange={(e) => { setEnlaceError(null); setNuevoEnlace((n) => ({ ...n!, shopId: e.target.value })) }} className="input">
                      <option value="">Seleccionar</option>
                      {shopsPorPais(nuevoEnlace.paisCodigo).map((s) => <option key={s.id} value={s.id}>{s.shopifyStoreName} ({s.country})</option>)}
                    </select>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <button onClick={handleAddEnlace} disabled={!nuevoEnlace.shopId} className="btn-primary inline-flex items-center gap-2"><Check size={16} /> Vincular</button>
                  <button onClick={() => { setEnlaceError(null); setNuevoEnlace(null) }} className="btn-secondary inline-flex items-center gap-2">Cancelar</button>
                </div>
              </div>
            ) : (
              <button onClick={() => { setEnlaceError(null); setNuevoEnlace({ paisCodigo: paises.filter((p) => p.activo)[0]?.codigo || '', shopId: '' }) }} className="mt-4 btn-secondary inline-flex items-center gap-2 w-full justify-center"><Link2 size={18} /> Vincular tienda</button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
