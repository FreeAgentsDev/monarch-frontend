import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Pencil, Trash2, Save, X, Eye, Image } from 'lucide-react'
import { useCatalogo } from '../hooks/useCatalogo'
import { usePaises } from '../hooks/usePaisesInversionistas'
import type { ProductoCatalogo } from '../utils/storage'
import { inputErrorClass } from '../utils/formValidation'

const EMPTY_DRAFT: Omit<ProductoCatalogo, 'id'> = {
  sku: '', nombre: '', categoria: 'Combos', precioMayorista: 0, moneda: 'USD', imagen: '', activo: true,
}

const CATEGORIAS = ['Combos', 'Aros', 'Collares', 'Pulseras', 'Anillos', 'Pendientes', 'Sets']

export default function Catalogo() {
  const { productos, add, update, remove } = useCatalogo()
  const { paises } = usePaises()
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draft, setDraft] = useState(EMPTY_DRAFT)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [preview, setPreview] = useState<ProductoCatalogo | null>(null)

  const startAdd = () => { setIsAdding(true); setEditingId(null); setErrors({}); setDraft(EMPTY_DRAFT) }
  const startEdit = (p: ProductoCatalogo) => {
    setIsAdding(false); setEditingId(p.id); setErrors({})
    setDraft({ sku: p.sku, nombre: p.nombre, categoria: p.categoria, precioMayorista: p.precioMayorista, moneda: p.moneda, imagen: p.imagen, activo: p.activo })
  }
  const cancel = () => { setIsAdding(false); setEditingId(null); setErrors({}) }

  const save = () => {
    const err: Record<string, string> = {}
    if (!draft.sku.trim()) err.sku = 'Obligatorio'
    if (!draft.nombre.trim()) err.nombre = 'Obligatorio'
    if (draft.precioMayorista <= 0) err.precioMayorista = 'Debe ser mayor a 0'
    setErrors(err)
    if (Object.keys(err).length) return

    if (isAdding) { add(draft); setIsAdding(false) }
    else if (editingId) { update(editingId, draft); setEditingId(null) }
    setErrors({})
  }

  const activos = productos.filter((p) => p.activo).length

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Catalogo de productos</h1>
          <p className="page-subtitle">Inventario Kevin Jewelry. Los empresarios e inversionistas ven estos productos.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/catalogo/EC" className="btn-secondary"><Eye size={16} /> Vista publica</Link>
          <button onClick={startAdd} className="btn-primary"><Plus size={16} /> Agregar producto</button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="kpi">
          <p className="kpi-label">Productos</p>
          <p className="kpi-value">{productos.length}</p>
          <p className="kpi-sub">{activos} activos</p>
        </div>
        <div className="kpi">
          <p className="kpi-label">Categorias</p>
          <p className="kpi-value">{new Set(productos.map((p) => p.categoria)).size}</p>
        </div>
        <div className="kpi">
          <p className="kpi-label">Precio promedio</p>
          <p className="kpi-value">${productos.length ? Math.round(productos.reduce((s, p) => s + p.precioMayorista, 0) / productos.length) : 0}</p>
        </div>
        <div className="kpi">
          <p className="kpi-label">Paises con catalogo</p>
          <p className="kpi-value">{paises.filter((p) => p.activo).length}</p>
        </div>
      </div>

      {/* Form */}
      {(isAdding || editingId) && (
        <div className="card bg-primary-50/50 border-primary-200">
          <h3 className="font-semibold text-gray-900 mb-4">{isAdding ? 'Nuevo producto' : 'Editar producto'}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
              <input type="text" value={draft.sku} onChange={(e) => { setDraft((d) => ({ ...d, sku: e.target.value.toUpperCase() })); setErrors((er) => ({ ...er, sku: '' })) }}
                className={`input ${inputErrorClass(!!errors.sku)}`} placeholder="MON-005" />
              {errors.sku && <p className="text-xs text-red-600 mt-1">{errors.sku}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
              <input type="text" value={draft.nombre} onChange={(e) => { setDraft((d) => ({ ...d, nombre: e.target.value })); setErrors((er) => ({ ...er, nombre: '' })) }}
                className={`input ${inputErrorClass(!!errors.nombre)}`} placeholder="Combo Esmeralda 5mm" />
              {errors.nombre && <p className="text-xs text-red-600 mt-1">{errors.nombre}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
              <select value={draft.categoria} onChange={(e) => setDraft((d) => ({ ...d, categoria: e.target.value }))} className="input">
                {CATEGORIAS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Precio mayorista</label>
              <input type="number" min={0} step={0.01} value={draft.precioMayorista} onChange={(e) => { setDraft((d) => ({ ...d, precioMayorista: Number(e.target.value) })); setErrors((er) => ({ ...er, precioMayorista: '' })) }}
                className={`input ${inputErrorClass(!!errors.precioMayorista)}`} />
              {errors.precioMayorista && <p className="text-xs text-red-600 mt-1">{errors.precioMayorista}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Moneda</label>
              <select value={draft.moneda} onChange={(e) => setDraft((d) => ({ ...d, moneda: e.target.value }))} className="input">
                <option>USD</option><option>COP</option><option>EUR</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">URL imagen</label>
              <input type="text" value={draft.imagen} onChange={(e) => setDraft((d) => ({ ...d, imagen: e.target.value }))}
                className="input" placeholder="/img/producto.webp" />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={draft.activo} onChange={(e) => setDraft((d) => ({ ...d, activo: e.target.checked }))} className="rounded border-gray-300" />
                <span className="text-sm text-gray-700">Activo</span>
              </label>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={save} className="btn-primary"><Save size={16} /> Guardar</button>
            <button onClick={cancel} className="btn-secondary"><X size={16} /> Cancelar</button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="card-flush">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="table-header">
                <th className="table-th">Imagen</th>
                <th className="table-th">SKU</th>
                <th className="table-th">Producto</th>
                <th className="table-th">Categoria</th>
                <th className="table-th text-right">Precio</th>
                <th className="table-th">Estado</th>
                <th className="table-th text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productos.map((p) => (
                <tr key={p.id} className={`table-row ${!p.activo ? 'opacity-50' : ''}`}>
                  <td className="table-td">
                    {p.imagen ? (
                      <button type="button" onClick={() => setPreview(p)}
                        className="w-12 h-12 rounded-lg overflow-hidden border border-gray-200 bg-gray-50 hover:shadow-sm transition-shadow">
                        <img src={p.imagen} alt={p.nombre} className="w-full h-full object-cover" />
                      </button>
                    ) : (
                      <div className="w-12 h-12 rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center">
                        <Image size={16} className="text-gray-300" />
                      </div>
                    )}
                  </td>
                  <td className="table-td font-mono text-xs text-gray-900">{p.sku}</td>
                  <td className="table-td font-medium text-gray-900">{p.nombre}</td>
                  <td className="table-td"><span className="badge-gray">{p.categoria}</span></td>
                  <td className="table-td text-right font-semibold tabular-nums">{p.precioMayorista} {p.moneda}</td>
                  <td className="table-td"><span className={p.activo ? 'badge-green' : 'badge-gray'}>{p.activo ? 'Activo' : 'Inactivo'}</span></td>
                  <td className="table-td text-right">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => startEdit(p)} className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg"><Pencil size={14} /></button>
                      <button onClick={() => { if (window.confirm(`Eliminar "${p.nombre}"?`)) remove(p.id) }} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {productos.length === 0 && (
                <tr><td colSpan={7} className="table-td text-center py-12 text-gray-400">No hay productos en el catalogo.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Preview modal */}
      {preview && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-4" onClick={() => setPreview(null)}>
          <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <button type="button" onClick={() => setPreview(null)}
              className="absolute top-3 right-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 z-10">
              <X size={16} />
            </button>
            {preview.imagen && (
              <div className="bg-gray-100">
                <img src={preview.imagen} alt={preview.nombre} className="w-full h-64 object-cover" />
              </div>
            )}
            <div className="p-5">
              <p className="text-xs font-mono text-gray-500">{preview.sku}</p>
              <h3 className="text-lg font-semibold text-gray-900 mt-1">{preview.nombre}</h3>
              <div className="flex items-center gap-3 mt-2">
                <span className="badge-gray">{preview.categoria}</span>
                <span className="text-lg font-bold text-gray-900">{preview.precioMayorista} {preview.moneda}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
