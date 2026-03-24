import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, ArrowLeft, Pencil, Trash2, Save, X } from 'lucide-react'
import { useEmpresarios } from '../hooks/useEmpresarios'
import type { Empresario } from '../utils/storage'

export default function GestionEmpresarios() {
  const { empresarios, add, update, remove } = useEmpresarios()
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const editing = useMemo(() => empresarios.find((e) => e.id === editingId) ?? null, [empresarios, editingId])

  const [draft, setDraft] = useState<Omit<Empresario, 'id' | 'createdAt' | 'updatedAt'>>({
    nombre: '',
    email: '',
    telefono: '',
    activo: true,
    notas: '',
  })

  const startAdd = () => {
    setIsAdding(true)
    setEditingId(null)
    setDraft({ nombre: '', email: '', telefono: '', activo: true, notas: '' })
  }

  const startEdit = (e: Empresario) => {
    setIsAdding(false)
    setEditingId(e.id)
    setDraft({
      nombre: e.nombre,
      email: e.email,
      telefono: e.telefono ?? '',
      activo: e.activo,
      notas: e.notas ?? '',
    })
  }

  const cancel = () => {
    setIsAdding(false)
    setEditingId(null)
  }

  const save = () => {
    if (!draft.nombre.trim() || !draft.email.trim()) return
    if (isAdding) {
      add({ ...draft, telefono: draft.telefono?.trim() || undefined, notas: draft.notas?.trim() || undefined })
      setIsAdding(false)
      return
    }
    if (editingId) {
      update(editingId, { ...draft, telefono: draft.telefono?.trim() || undefined, notas: draft.notas?.trim() || undefined })
      setEditingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          to="/empresarios/panel"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-2"
        >
          <ArrowLeft size={16} />
          Volver al Panel del empresario
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Gestión de empresarios</h1>
        <p className="text-gray-600 mt-1">Crea, edita y administra empresarios (demo persistente).</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card overflow-hidden p-0">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-gray-900">Empresarios</h2>
              <p className="text-sm text-gray-500">{empresarios.length} registro(s)</p>
            </div>
            <button
              type="button"
              onClick={startAdd}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-primary-600 text-white text-sm font-medium hover:bg-primary-700"
            >
              <Plus size={16} />
              Nuevo
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Nombre</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Email</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Estado</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-700">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {empresarios.map((e) => (
                  <tr key={e.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                    <td className="py-3 px-4 font-medium text-gray-900">{e.nombre}</td>
                    <td className="py-3 px-4 text-gray-600">{e.email}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                        e.activo ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {e.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex gap-2">
                        <button
                          type="button"
                          onClick={() => startEdit(e)}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"
                        >
                          <Pencil size={14} />
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`¿Eliminar al empresario "${e.nombre}"?`)) remove(e.id)
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-red-200 text-red-700 hover:bg-red-50"
                        >
                          <Trash2 size={14} />
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!empresarios.length && (
                  <tr>
                    <td colSpan={4} className="py-10 text-center text-gray-500">No hay empresarios.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">
              {isAdding ? 'Nuevo empresario' : editing ? 'Editar empresario' : 'Detalle'}
            </h2>
            {(isAdding || editing) && (
              <button
                type="button"
                onClick={cancel}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-gray-100"
                aria-label="Cerrar"
              >
                <X size={18} />
              </button>
            )}
          </div>

          {!(isAdding || editing) ? (
            <div className="text-sm text-gray-600">
              Selecciona un empresario o crea uno nuevo.
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                <input
                  value={draft.nombre}
                  onChange={(e) => setDraft((p) => ({ ...p, nombre: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  value={draft.email}
                  onChange={(e) => setDraft((p) => ({ ...p, email: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                <input
                  value={draft.telefono ?? ''}
                  onChange={(e) => setDraft((p) => ({ ...p, telefono: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">Activo</label>
                <input
                  type="checkbox"
                  checked={draft.activo}
                  onChange={(e) => setDraft((p) => ({ ...p, activo: e.target.checked }))}
                  className="h-4 w-4"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
                <textarea
                  value={draft.notas ?? ''}
                  onChange={(e) => setDraft((p) => ({ ...p, notas: e.target.value }))}
                  rows={3}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <button
                type="button"
                onClick={save}
                className="inline-flex w-full items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 disabled:opacity-50"
                disabled={!draft.nombre.trim() || !draft.email.trim()}
              >
                <Save size={16} />
                Guardar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

