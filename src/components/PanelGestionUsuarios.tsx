import { useState, useEffect, useCallback } from 'react'
import { Plus, Pencil, Trash2, Shield, UserCheck } from 'lucide-react'
import { demoStorage, STORAGE_KEYS, DEFAULT_USUARIOS, UsuarioSistema, RolUsuario } from '../utils/storage'
import { isValidEmail, inputErrorClass } from '../utils/formValidation'

const ROL_LABELS: Record<RolUsuario, string> = {
  admin: 'Admin',
  inversionista: 'Inversionista',
  empresario: 'Empresario',
}

function uid() {
  return `u_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}

export default function PanelGestionUsuarios() {
  const [usuarios, setUsuarios] = useState<UsuarioSistema[]>(() => {
    const stored = demoStorage.get<UsuarioSistema[]>(STORAGE_KEYS.USUARIOS)
    return stored?.length ? stored : [...DEFAULT_USUARIOS]
  })
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [form, setForm] = useState<Partial<UsuarioSistema>>({
    nombre: '',
    email: '',
    rol: 'admin',
    activo: true,
  })
  const [formErrors, setFormErrors] = useState<{ nombre?: string; email?: string; rol?: string }>({})

  useEffect(() => {
    demoStorage.set(STORAGE_KEYS.USUARIOS, usuarios)
  }, [usuarios])

  const handleSave = useCallback(() => {
    const err: { nombre?: string; email?: string; rol?: string } = {}
    if (!form.nombre?.trim()) err.nombre = 'El nombre es obligatorio.'
    if (!form.email?.trim()) err.email = 'El email es obligatorio.'
    else if (!isValidEmail(form.email)) err.email = 'Introduce un email válido.'
    if (!form.rol) err.rol = 'El rol es obligatorio.'
    setFormErrors(err)
    if (Object.keys(err).length) return

    const now = new Date().toISOString()
    const nombre = form.nombre!.trim()
    const email = form.email!.trim()
    const rol = form.rol!
    if (isAdding) {
      const nuevo: UsuarioSistema = {
        id: uid(),
        nombre,
        email,
        rol,
        activo: form.activo ?? true,
        createdAt: now,
        updatedAt: now,
      }
      setUsuarios((prev) => [...prev, nuevo])
      setForm({ nombre: '', email: '', rol: 'admin', activo: true })
      setFormErrors({})
      setIsAdding(false)
    } else if (editingId) {
      setUsuarios((prev) =>
        prev.map((u) =>
          u.id === editingId
            ? { ...u, nombre: form.nombre!, email: form.email!, rol: form.rol!, activo: form.activo ?? true, updatedAt: now }
            : u
        )
      )
      setEditingId(null)
      setForm({ nombre: '', email: '', rol: 'admin', activo: true })
      setFormErrors({})
    }
  }, [form, isAdding, editingId])

  const handleEdit = useCallback((u: UsuarioSistema) => {
    setFormErrors({})
    setForm({
      nombre: u.nombre,
      email: u.email,
      rol: u.rol,
      activo: u.activo,
    })
    setEditingId(u.id)
    setIsAdding(false)
  }, [])

  const handleDelete = useCallback((u: UsuarioSistema) => {
    if (window.confirm(`¿Eliminar al usuario "${u.nombre}"?`)) {
      setUsuarios((prev) => prev.filter((x) => x.id !== u.id))
      if (editingId === u.id) {
        setEditingId(null)
        setForm({ nombre: '', email: '', rol: 'admin', activo: true })
      }
    }
  }, [editingId])

  const handleCancel = useCallback(() => {
    setEditingId(null)
    setIsAdding(false)
    setFormErrors({})
    setForm({ nombre: '', email: '', rol: 'admin', activo: true })
  }, [])

  return (
    <div className="card overflow-hidden p-0">
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
            <Shield size={20} className="text-amber-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Gestión de usuarios</h2>
            <p className="text-sm text-gray-500">Solo visible para Admin y Superadmin</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            setIsAdding(true)
            setEditingId(null)
            setForm({ nombre: '', email: '', rol: 'admin', activo: true })
            setFormErrors({})
          }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-600 text-white text-sm font-medium hover:bg-primary-700"
        >
          <Plus size={18} />
          Nuevo usuario
        </button>
      </div>

      {(isAdding || editingId) && (
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-3">{isAdding ? 'Nuevo usuario' : 'Editar usuario'}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="sm:col-span-1">
              <label className="block text-xs font-medium text-gray-600 mb-1">Nombre</label>
              <input
                type="text"
                placeholder="Nombre"
                value={form.nombre}
                onChange={(e) => {
                  setForm((f) => ({ ...f, nombre: e.target.value }))
                  setFormErrors((er) => ({ ...er, nombre: undefined }))
                }}
                className={`input ${inputErrorClass(!!formErrors.nombre)}`}
              />
              {formErrors.nombre && <p className="text-xs text-red-600 mt-1">{formErrors.nombre}</p>}
            </div>
            <div className="sm:col-span-1">
              <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
              <input
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={(e) => {
                  setForm((f) => ({ ...f, email: e.target.value }))
                  setFormErrors((er) => ({ ...er, email: undefined }))
                }}
                className={`input ${inputErrorClass(!!formErrors.email)}`}
              />
              {formErrors.email && <p className="text-xs text-red-600 mt-1">{formErrors.email}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Rol</label>
              <select
                value={form.rol}
                onChange={(e) => {
                  setForm((f) => ({ ...f, rol: e.target.value as RolUsuario }))
                  setFormErrors((er) => ({ ...er, rol: undefined }))
                }}
                className={`input ${inputErrorClass(!!formErrors.rol)}`}
              >
              {(Object.keys(ROL_LABELS) as RolUsuario[]).map((r) => (
                <option key={r} value={r}>
                  {ROL_LABELS[r]}
                </option>
              ))}
              </select>
              {formErrors.rol && <p className="text-xs text-red-600 mt-1">{formErrors.rol}</p>}
            </div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.activo ?? true}
                onChange={(e) => setForm((f) => ({ ...f, activo: e.target.checked }))}
                className="rounded border-gray-300"
              />
              <span className="text-sm text-gray-700">Activo</span>
            </label>
          </div>
          <div className="flex gap-2 mt-3">
            <button type="button" onClick={handleSave} className="px-4 py-2 rounded-lg bg-primary-600 text-white text-sm font-medium hover:bg-primary-700">
              Guardar
            </button>
            <button type="button" onClick={handleCancel} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50">
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left py-3 px-4 font-medium text-gray-700">Usuario</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">Email</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">Rol</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">Estado</th>
              <th className="text-right py-3 px-4 font-medium text-gray-700">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u) => (
              <tr key={u.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <UserCheck size={18} className="text-gray-400" />
                    <span className="font-medium text-gray-900">{u.nombre}</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-gray-600">{u.email}</td>
                <td className="py-3 px-4">
                  <span
                    className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                      u.rol === 'admin'
                        ? 'bg-blue-100 text-blue-800'
                        : u.rol === 'inversionista'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-green-100 text-green-800'
                    }`}
                  >
                    {ROL_LABELS[u.rol]}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className={u.activo ? 'text-green-600 text-sm font-medium' : 'text-gray-400 text-sm'}>
                    {u.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      type="button"
                      onClick={() => handleEdit(u)}
                      className="p-2 rounded-lg text-gray-500 hover:text-primary-600 hover:bg-primary-50"
                      title="Editar"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(u)}
                      className="p-2 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50"
                      title="Eliminar"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
