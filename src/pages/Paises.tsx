import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { accountingApi } from '../services/api'
import { MapPin, Plus, Pencil, Trash2, Check, X, FileSpreadsheet } from 'lucide-react'
import { usePaises } from '../hooks/usePaisesInversionistas'
import type { Pais } from '../utils/storage'
import { isValidCountryCode, normalizeCountryCode, inputErrorClass } from '../utils/formValidation'

export default function Paises() {
  const { paises, add, update, remove } = usePaises()
  const [estadoData, setEstadoData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // Inline editing
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [form, setForm] = useState<Partial<Pais>>({ codigo: '', nombre: '', moneda: '', activo: true })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    accountingApi.getEstadoResultados().then((res) => setEstadoData(res.data)).catch(console.error).finally(() => setLoading(false))
  }, [])

  const getUtilidadForCountry = (countryCode: string) => {
    if (!estadoData?.countries) return null
    const code = countryCode.toLowerCase()
    const country = estadoData.countries.find((c: any) => c.id === code || c.id?.toLowerCase() === code)
    if (!country) return null
    const row = country.concepts?.find((r: any) => r.concept === 'UTILIDAD OPERACIONAL')
    return row?.total ?? null
  }

  const getIngresosForCountry = (countryCode: string) => {
    if (!estadoData?.countries) return null
    const code = countryCode.toLowerCase()
    const country = estadoData.countries.find((c: any) => c.id === code || c.id?.toLowerCase() === code)
    if (!country) return null
    const row = country.concepts?.find((r: any) => r.concept === 'INGRESO DOLARES' || r.concept === 'INGRESOS PESOS')
    return row?.total ?? null
  }

  const handleSave = () => {
    const next: Record<string, string> = {}
    const codigoNorm = normalizeCountryCode(form.codigo || '')
    if (!form.nombre?.trim()) next.nombre = 'El nombre es obligatorio.'
    if (!form.moneda?.trim()) next.moneda = 'La moneda es obligatoria.'
    if (!codigoNorm) next.codigo = 'El codigo de pais es obligatorio.'
    else if (!isValidCountryCode(codigoNorm)) next.codigo = 'Use 2 o 3 letras (ej. CO, EC).'
    setErrors(next)
    if (Object.keys(next).length) return
    if (isAdding) {
      add({ codigo: codigoNorm, nombre: form.nombre!.trim(), moneda: form.moneda!.trim().toUpperCase(), activo: form.activo ?? true, orden: paises.length + 1 })
      setForm({ codigo: '', nombre: '', moneda: '', activo: true }); setErrors({}); setIsAdding(false)
    } else if (editingId) {
      update(editingId, { codigo: codigoNorm, nombre: form.nombre!.trim(), moneda: form.moneda!.trim().toUpperCase(), activo: form.activo })
      setEditingId(null); setErrors({})
    }
  }

  const handleEdit = (p: Pais) => { setForm({ codigo: p.codigo, nombre: p.nombre, moneda: p.moneda, activo: p.activo }); setEditingId(p.id); setIsAdding(false); setErrors({}) }
  const handleCancel = () => { setEditingId(null); setIsAdding(false); setErrors({}); setForm({ codigo: '', nombre: '', moneda: '', activo: true }) }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-pulse text-gray-400">Cargando paises...</div></div>

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Paises</h1>
          <p className="page-subtitle">Operaciones por pais de la plataforma Monarch.</p>
        </div>
        <button
          onClick={() => { setIsAdding(true); setEditingId(null); setForm({ codigo: '', nombre: '', moneda: '', activo: true }); setErrors({}) }}
          className="btn-primary"
        >
          <Plus size={16} /> Nuevo pais
        </button>
      </div>

      {(isAdding || editingId) && (
        <div className="card bg-primary-50/50 border-primary-200">
          <h3 className="font-semibold text-gray-900 mb-4">{isAdding ? 'Nuevo pais' : 'Editar pais'}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Codigo (ISO)</label>
              <input type="text" value={form.codigo || ''} onChange={(e) => { const v = e.target.value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 3); setForm((f) => ({ ...f, codigo: v })); setErrors((er) => ({ ...er, codigo: '' })) }} className={`input ${inputErrorClass(!!errors.codigo)}`} maxLength={3} />
              {errors.codigo && <p className="text-xs text-red-600 mt-1">{errors.codigo}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
              <input type="text" value={form.nombre || ''} onChange={(e) => { setForm((f) => ({ ...f, nombre: e.target.value })); setErrors((er) => ({ ...er, nombre: '' })) }} className={`input ${inputErrorClass(!!errors.nombre)}`} />
              {errors.nombre && <p className="text-xs text-red-600 mt-1">{errors.nombre}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Moneda</label>
              <input type="text" value={form.moneda || ''} onChange={(e) => { setForm((f) => ({ ...f, moneda: e.target.value })); setErrors((er) => ({ ...er, moneda: '' })) }} className={`input ${inputErrorClass(!!errors.moneda)}`} />
              {errors.moneda && <p className="text-xs text-red-600 mt-1">{errors.moneda}</p>}
            </div>
            <div className="flex items-end gap-2">
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {paises
          .sort((a, b) => (a.orden ?? 99) - (b.orden ?? 99))
          .map((pais) => {
            const utilidad = getUtilidadForCountry(pais.codigo)
            const ingresos = getIngresosForCountry(pais.codigo)
            return (
              <div key={pais.id} className={`card ${!pais.activo ? 'opacity-60' : ''}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
                      <MapPin size={20} className="text-primary-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{pais.nombre}</h3>
                      <p className="text-sm text-gray-500">{pais.codigo} · {pais.moneda}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => handleEdit(pais)} className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg"><Pencil size={14} /></button>
                    <button onClick={() => { if (window.confirm(`Eliminar "${pais.nombre}"?`)) remove(pais.id) }} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={14} /></button>
                  </div>
                </div>
                {!pais.activo && <span className="mt-2 inline-flex text-xs px-2 py-1 rounded bg-amber-100 text-amber-800">Proximamente</span>}
                {pais.activo && (utilidad !== null || ingresos !== null) && (
                  <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
                    {utilidad !== null && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Utilidad operacional</span>
                        <span className="font-medium">{Number(utilidad).toLocaleString('es-ES')}</span>
                      </div>
                    )}
                    {ingresos !== null && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Ingresos</span>
                        <span className="font-medium">{Number(ingresos).toLocaleString('es-ES')}</span>
                      </div>
                    )}
                  </div>
                )}
                {pais.activo && (
                  <div className="mt-4 pt-3 border-t border-gray-100 flex flex-wrap gap-2">
                    <Link to={`/empresarios?pais=${pais.codigo}`} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-green-50 text-green-700 text-xs font-medium hover:bg-green-100">
                      Empresarios
                    </Link>
                    <Link to={`/catalogo/${pais.codigo}`} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary-50 text-primary-700 text-xs font-medium hover:bg-primary-100">
                      Catalogo
                    </Link>
                    <Link to="/contabilidad" className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-100 text-gray-700 text-xs font-medium hover:bg-gray-200">
                      <FileSpreadsheet size={12} /> Contabilidad
                    </Link>
                  </div>
                )}
              </div>
            )
          })}
      </div>
    </div>
  )
}
