import { useState } from 'react'
import { Link } from 'react-router-dom'
import { MapPin, Plus, Pencil, Trash2, ArrowLeft, Check, X } from 'lucide-react'
import { usePaises } from '../hooks/usePaisesInversionistas'
import type { Pais } from '../utils/storage'

export default function GestionPaises() {
  const { paises, add, update, remove } = usePaises()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [form, setForm] = useState<Partial<Pais>>({ codigo: '', nombre: '', moneda: '', activo: true })

  const handleSave = () => {
    if (!form.codigo || !form.nombre || !form.moneda) return
    if (isAdding) {
      add({
        codigo: form.codigo.toUpperCase(),
        nombre: form.nombre,
        moneda: form.moneda,
        activo: form.activo ?? true,
        orden: paises.length + 1,
      })
      setForm({ codigo: '', nombre: '', moneda: '', activo: true })
      setIsAdding(false)
    } else if (editingId) {
      update(editingId, {
        codigo: form.codigo?.toUpperCase(),
        nombre: form.nombre,
        moneda: form.moneda,
        activo: form.activo,
      })
      setEditingId(null)
    }
  }

  const handleEdit = (p: Pais) => {
    setForm({
      codigo: p.codigo,
      nombre: p.nombre,
      moneda: p.moneda,
      activo: p.activo,
    })
    setEditingId(p.id)
    setIsAdding(false)
  }

  const handleCancel = () => {
    setEditingId(null)
    setIsAdding(false)
    setForm({ codigo: '', nombre: '', moneda: '', activo: true })
  }

  const handleDelete = (p: Pais) => {
    if (window.confirm(`¿Eliminar el país "${p.nombre}"?`)) remove(p.id)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link
            to="/paises"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-2"
          >
            <ArrowLeft size={16} />
            Volver a Países
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de países</h1>
          <p className="text-gray-600 mt-1">
            Crear, editar y administrar los países de la plataforma Monarch
          </p>
        </div>
        <button
          onClick={() => {
            setIsAdding(true)
            setEditingId(null)
            setForm({ codigo: '', nombre: '', moneda: '', activo: true })
          }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-600 text-white font-medium hover:bg-primary-700"
        >
          <Plus size={18} />
          Nuevo país
        </button>
      </div>

      {(isAdding || editingId) && (
        <div className="card bg-primary-50/50 border-primary-200">
          <h3 className="font-semibold text-gray-900 mb-4">
            {isAdding ? 'Nuevo país' : 'Editar país'}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Código (ISO)</label>
              <input
                type="text"
                value={form.codigo || ''}
                onChange={(e) => setForm((f) => ({ ...f, codigo: e.target.value }))}
                placeholder="CO"
                className="input"
                maxLength={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
              <input
                type="text"
                value={form.nombre || ''}
                onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
                placeholder="Colombia"
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Moneda</label>
              <input
                type="text"
                value={form.moneda || ''}
                onChange={(e) => setForm((f) => ({ ...f, moneda: e.target.value }))}
                placeholder="COP"
                className="input"
              />
            </div>
            <div className="flex items-end gap-2">
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
            <button onClick={handleSave} disabled={!form.codigo || !form.nombre || !form.moneda} className="btn-primary inline-flex items-center gap-2">
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
                <th className="text-left py-3 px-4 font-medium text-gray-700">País</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Código</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Moneda</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Estado</th>
                <th className="text-right py-3 px-4 font-medium text-gray-700">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {paises
                .sort((a, b) => (a.orden ?? 99) - (b.orden ?? 99))
                .map((p) => (
                  <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <MapPin size={18} className="text-gray-400" />
                        <span className="font-medium text-gray-900">{p.nombre}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{p.codigo}</td>
                    <td className="py-3 px-4 text-gray-600">{p.moneda}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                          p.activo ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {p.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEdit(p)}
                          className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg"
                          title="Editar"
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(p)}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
                          title="Eliminar"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
