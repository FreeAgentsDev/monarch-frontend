import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Users,
  Plus,
  Pencil,
  Trash2,
  ArrowLeft,
  Check,
  X,
  Store,
  Link2,
} from 'lucide-react'
import { useInversionistas, useInversionistaTiendas, usePaises } from '../hooks/usePaisesInversionistas'
import { shopifyApi } from '../services/api'
import type { Shop } from '../services/api'
import type { Inversionista } from '../utils/storage'

export default function GestionInversionistas() {
  const { inversionistas, add, update, remove } = useInversionistas()
  const { add: addEnlace, remove: removeEnlace, getByInversionista } = useInversionistaTiendas()
  const { paises } = usePaises()
  const [shops, setShops] = useState<Shop[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [form, setForm] = useState<Partial<Inversionista>>({
    nombre: '',
    email: '',
    telefono: '',
    activo: true,
  })
  const [detalleId, setDetalleId] = useState<string | null>(null)
  const [nuevoEnlace, setNuevoEnlace] = useState<{ paisCodigo: string; shopId: string } | null>(null)

  useEffect(() => {
    shopifyApi.getShops().then((r) => setShops(r.data)).catch(console.error)
  }, [])

  const handleSave = () => {
    if (!form.nombre || !form.email) return
    if (isAdding) {
      add({
        nombre: form.nombre,
        email: form.email,
        telefono: form.telefono,
        activo: form.activo ?? true,
        notas: form.notas,
      })
      setForm({ nombre: '', email: '', telefono: '', activo: true })
      setIsAdding(false)
    } else if (editingId) {
      update(editingId, {
        nombre: form.nombre,
        email: form.email,
        telefono: form.telefono,
        activo: form.activo,
        notas: form.notas,
      })
      setEditingId(null)
    }
  }

  const handleEdit = (inv: Inversionista) => {
    setForm({
      nombre: inv.nombre,
      email: inv.email,
      telefono: inv.telefono,
      activo: inv.activo,
      notas: inv.notas,
    })
    setEditingId(inv.id)
    setIsAdding(false)
  }

  const handleCancel = () => {
    setEditingId(null)
    setIsAdding(false)
    setForm({ nombre: '', email: '', telefono: '', activo: true })
  }

  const handleDelete = (inv: Inversionista) => {
    if (window.confirm(`¿Eliminar al inversionista "${inv.nombre}"? Se eliminarán sus enlaces a tiendas.`)) {
      getByInversionista(inv.id).forEach((e) => removeEnlace(e.id))
      remove(inv.id)
    }
  }

  const handleAddEnlace = () => {
    if (!detalleId || !nuevoEnlace?.paisCodigo || !nuevoEnlace?.shopId) return
    const shop = shops.find((s) => s.id === nuevoEnlace!.shopId)
    addEnlace({
      inversionistaId: detalleId,
      paisCodigo: nuevoEnlace.paisCodigo,
      shopId: nuevoEnlace.shopId,
      storeName: shop?.shopifyStoreName,
      activo: true,
    })
    setNuevoEnlace(null)
  }

  const shopsPorPais = (codigo: string) =>
    shops.filter((s) => s.countryCode === codigo)

  const invDetalle = detalleId ? inversionistas.find((i) => i.id === detalleId) : null
  const enlacesDelInv = invDetalle ? getByInversionista(invDetalle.id) : []

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link
            to="/inversionistas"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-2"
          >
            <ArrowLeft size={16} />
            Volver a Inversionistas
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de inversionistas</h1>
          <p className="text-gray-600 mt-1">
            Crear, editar y vincular inversionistas con sus tiendas por país
          </p>
        </div>
        <button
          onClick={() => {
            setIsAdding(true)
            setEditingId(null)
            setForm({ nombre: '', email: '', telefono: '', activo: true })
          }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-600 text-white font-medium hover:bg-primary-700"
        >
          <Plus size={18} />
          Nuevo inversionista
        </button>
      </div>

      {(isAdding || editingId) && (
        <div className="card bg-primary-50/50 border-primary-200">
          <h3 className="font-semibold text-gray-900 mb-4">
            {isAdding ? 'Nuevo inversionista' : 'Editar inversionista'}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
              <input
                type="text"
                value={form.nombre || ''}
                onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
                placeholder="María González"
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={form.email || ''}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="maria@ejemplo.com"
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
              <input
                type="text"
                value={form.telefono || ''}
                onChange={(e) => setForm((f) => ({ ...f, telefono: e.target.value }))}
                placeholder="+57 300 123 4567"
                className="input"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
              <input
                type="text"
                value={form.notas || ''}
                onChange={(e) => setForm((f) => ({ ...f, notas: e.target.value }))}
                placeholder="Observaciones adicionales"
                className="input"
              />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.activo ?? true}
                  onChange={(e) => setForm((f) => ({ ...f, activo: e.target.checked }))}
                  className="rounded border-gray-300"
                />
                <span className="text-sm text-gray-700">Activo</span>
              </label>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleSave}
              disabled={!form.nombre || !form.email}
              className="btn-primary inline-flex items-center gap-2"
            >
              <Check size={16} />
              Guardar
            </button>
            <button onClick={handleCancel} className="btn-secondary inline-flex items-center gap-2">
              <X size={16} />
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left py-3 px-4 font-medium text-gray-700">Inversionista</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Email</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Estado</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Tiendas</th>
                <th className="text-right py-3 px-4 font-medium text-gray-700">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {inversionistas.map((inv) => {
                const count = getByInversionista(inv.id).length
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
                      <span
                        className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                          inv.activo ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {inv.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-gray-600">{count} tienda(s)</span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => {
                            setDetalleId(inv.id)
                            setNuevoEnlace(null)
                          }}
                          className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg"
                          title="Gestionar tiendas"
                        >
                          <Link2 size={18} />
                        </button>
                        <button
                          onClick={() => handleEdit(inv)}
                          className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg"
                          title="Editar"
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(inv)}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
                          title="Eliminar"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {inversionistas.length === 0 && (
          <div className="py-12 text-center text-gray-500">
            No hay inversionistas. Crea el primero para comenzar.
          </div>
        )}
      </div>

      {detalleId && invDetalle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="card max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Tiendas de {invDetalle.nombre}
              </h2>
              <button
                onClick={() => {
                  setDetalleId(null)
                  setNuevoEnlace(null)
                }}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Vincula las tiendas Shopify de este inversionista por país
            </p>

            <div className="space-y-4">
              {enlacesDelInv.map((e) => {
                const pais = paises.find((p) => p.codigo === e.paisCodigo)
                const shop = shops.find((s) => s.id === e.shopId)
                return (
                  <div
                    key={e.id}
                    className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Store size={20} className="text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900">
                          {shop?.shopifyStoreName || e.storeName || 'Sin nombre'}
                        </p>
                        <p className="text-sm text-gray-500">
                          {pais?.nombre || e.paisCodigo} · {shop?.country || e.paisCodigo}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeEnlace(e.id)}
                      className="text-red-600 hover:text-red-700 text-sm font-medium"
                    >
                      Desvincular
                    </button>
                  </div>
                )
              })}
            </div>

            {nuevoEnlace ? (
              <div className="mt-4 p-4 bg-primary-50 rounded-lg space-y-3">
                <h4 className="font-medium text-gray-900">Nueva vinculación</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">País</label>
                    <select
                      value={nuevoEnlace.paisCodigo}
                      onChange={(e) =>
                        setNuevoEnlace((n) => ({ ...n!, paisCodigo: e.target.value, shopId: '' }))
                      }
                      className="input"
                    >
                      <option value="">Seleccionar</option>
                      {paises.filter((p) => p.activo).map((p) => (
                        <option key={p.id} value={p.codigo}>
                          {p.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tienda Shopify</label>
                      <select
                        value={nuevoEnlace.shopId}
                        onChange={(e) => setNuevoEnlace((n) => ({ ...n!, shopId: e.target.value }))}
                        className="input"
                      >
                        <option value="">Seleccionar</option>
                        {shopsPorPais(nuevoEnlace.paisCodigo).map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.shopifyStoreName} ({s.country})
                          </option>
                        ))}
                        {shopsPorPais(nuevoEnlace.paisCodigo).length === 0 && nuevoEnlace.paisCodigo && (
                          <option value="" disabled>
                            No hay tiendas en este país
                          </option>
                        )}
                      </select>
                    </div>
                  </div>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={handleAddEnlace}
                    disabled={!nuevoEnlace.shopId}
                    className="btn-primary inline-flex items-center gap-2"
                  >
                    <Check size={16} />
                    Vincular
                  </button>
                  <button
                    onClick={() => setNuevoEnlace(null)}
                    className="btn-secondary inline-flex items-center gap-2"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() =>
                  setNuevoEnlace({ paisCodigo: paises.filter((p) => p.activo)[0]?.codigo || '', shopId: '' })
                }
                className="mt-4 btn-secondary inline-flex items-center gap-2 w-full justify-center"
              >
                <Link2 size={18} />
                Vincular tienda por país
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
