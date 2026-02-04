import { useEffect, useState, useMemo, Fragment, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { accountingApi } from '../services/api'
import { demoStorage, STORAGE_KEYS } from '../utils/storage'
import { getExchangeRates } from '../components/contabilidad/ExchangeRatesConfig'
import ExchangeRatesConfig from '../components/contabilidad/ExchangeRatesConfig'
import { BarChart3, RotateCcw, Calculator, Pencil, Globe } from 'lucide-react'

const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'] as const
const MESES_LABEL = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

const SECTION_LABELS: Record<string, string> = {
  ingresos: 'Ingresos',
  deducciones: 'Deducciones',
  tipo_cambio: 'Tipo de cambio',
  costos: 'Costos',
  utilidad_bruta: 'Utilidad bruta',
  gastos_adm: 'Gastos administrativos',
  utilidad_empresarios: 'Utilidad empresarios',
  gastos_operacionales: 'Gastos operacionales',
  utilidad_operacional: 'Utilidad operacional',
}

interface ConceptRow {
  concept: string
  section?: string
  enero?: number
  febrero?: number
  marzo?: number
  abril?: number
  mayo?: number
  junio?: number
  julio?: number
  agosto?: number
  septiembre?: number
  octubre?: number
  noviembre?: number
  diciembre?: number
  total?: number
}

interface CountryData {
  id: string
  name: string
  currency: string
  concepts: ConceptRow[]
}

interface EstadoResultadosData {
  countries: CountryData[]
}

function formatValue(val: number | undefined, isPercent = false): string {
  if (val === undefined || val === null) return '-'
  if (isPercent) return `${(val * 100).toFixed(1)}%`
  if (Math.abs(val) >= 1e6) return val.toLocaleString('es-ES', { maximumFractionDigits: 0 })
  if (Math.abs(val) < 1 && val !== 0 && !Number.isInteger(val)) return val.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  return val.toLocaleString('es-ES', { maximumFractionDigits: 2 })
}

function isConceptMargin(concept: string): boolean {
  return concept.includes('MARGEN')
}

function sumMonths(row: ConceptRow): number {
  return MESES.reduce((acc, m) => acc + (Number(row[m]) || 0), 0)
}

function deepCloneData(data: EstadoResultadosData): EstadoResultadosData {
  return JSON.parse(JSON.stringify(data))
}

function convertToCOP(value: number, currency: string, rates: Record<string, number>): number {
  const rate = rates[currency] ?? 1
  return value * rate
}

export default function EstadoDeResultados() {
  const [data, setData] = useState<EstadoResultadosData | null>(null)
  const [editableData, setEditableData] = useState<EstadoResultadosData | null>(null)
  const [countryId, setCountryId] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})
  const [editedCells, setEditedCells] = useState<Set<string>>(new Set())
  const [viewMode, setViewMode] = useState<'por-pais' | 'consolidado'>('por-pais')
  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>(() => getExchangeRates())

  useEffect(() => {
    accountingApi.getEstadoResultados().then((res) => {
      const payload = res.data as EstadoResultadosData
      setData(payload)
      const stored = demoStorage.get<EstadoResultadosData>(STORAGE_KEYS.ESTADO_RESULTADOS)
      setEditableData(stored?.countries?.length ? deepCloneData(stored) : deepCloneData(payload))
      if (payload?.countries?.length) setCountryId(payload.countries[0].id)
    }).catch(console.error).finally(() => setLoading(false))
  }, [])

  const handleCellChange = useCallback((countryId: string, conceptIdx: number, mes: typeof MESES[number], value: number | '') => {
    setEditableData((prev) => {
      if (!prev) return prev
      const next = deepCloneData(prev)
      const country = next.countries.find((c) => c.id === countryId)
      if (!country || !country.concepts[conceptIdx]) return prev
      const row = country.concepts[conceptIdx]
      const num = value === '' ? 0 : Number(value)
      ;(row as unknown as Record<string, number>)[mes] = isNaN(num) ? 0 : num
      row.total = sumMonths(row)
      return next
    })
    setEditedCells((prev) => new Set(prev).add(`${countryId}-${conceptIdx}-${mes}`))
  }, [])

  useEffect(() => {
    if (editableData?.countries?.length) {
      demoStorage.set(STORAGE_KEYS.ESTADO_RESULTADOS, editableData)
    }
  }, [editableData])

  const handleReset = useCallback(() => {
    if (data) {
      demoStorage.remove(STORAGE_KEYS.ESTADO_RESULTADOS)
      setEditableData(deepCloneData(data))
      setEditedCells(new Set())
    }
  }, [data])

  if (loading || !data || !editableData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Cargando estado de resultados...</div>
      </div>
    )
  }

  const country = editableData.countries.find((c) => c.id === countryId) || editableData.countries[0]
  const concepts = country?.concepts || []
  const hasChanges = editedCells.size > 0

  const sections = useMemo(() => {
    const map = new Map<string, ConceptRow[]>()
    concepts.forEach((row) => {
      const section = row.section ?? 'otros'
      if (!map.has(section)) map.set(section, [])
      map.get(section)!.push(row)
    })
    const order = ['ingresos', 'deducciones', 'tipo_cambio', 'costos', 'utilidad_bruta', 'gastos_adm', 'utilidad_empresarios', 'gastos_operacionales', 'utilidad_operacional', 'otros']
    return order.filter((s) => map.has(s)).map((s) => ({ id: s, label: SECTION_LABELS[s] ?? s, rows: map.get(s)! }))
  }, [concepts])

  // Vista consolidada: conceptos únicos con valores convertidos a COP por país
  const consolidatedData = useMemo(() => {
    if (!editableData) return []
    const conceptMap = new Map<string, { concept: string; section?: string; isMargin: boolean; byCountry: Record<string, number>; total: number }>()
    const sectionOrder = ['ingresos', 'deducciones', 'tipo_cambio', 'costos', 'utilidad_bruta', 'gastos_adm', 'utilidad_empresarios', 'gastos_operacionales', 'utilidad_operacional', 'otros']

    editableData.countries.forEach((c) => {
      c.concepts.forEach((row) => {
        const key = row.concept
        if (!conceptMap.has(key)) {
          conceptMap.set(key, {
            concept: key,
            section: row.section,
            isMargin: isConceptMargin(key),
            byCountry: {},
            total: 0,
          })
        }
        const entry = conceptMap.get(key)!
        const rowTotal = row.total ?? sumMonths(row)
        const inCOP = entry.isMargin ? rowTotal : convertToCOP(rowTotal, c.currency, exchangeRates)
        entry.byCountry[c.id] = inCOP
        if (!entry.isMargin) entry.total += inCOP
        else {
          const vals = Object.values(entry.byCountry).filter((x) => x !== 0)
          entry.total = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : rowTotal
        }
      })
    })

    const bySection = new Map<string, typeof conceptMap extends Map<string, infer V> ? V[] : never[]>()
    conceptMap.forEach((v) => {
      const s = v.section ?? 'otros'
      if (!bySection.has(s)) bySection.set(s, [])
      bySection.get(s)!.push(v as never)
    })
    return sectionOrder.filter((s) => bySection.has(s)).flatMap((s) => bySection.get(s)!)
  }, [editableData, exchangeRates])

  const toggleSection = (id: string) => {
    setCollapsed((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Estado de Resultados</h1>
          <p className="text-gray-600 mt-1 flex items-center gap-2">
            <Pencil size={16} className="text-primary-500" />
            Edita las celdas para simular escenarios — el total se recalcula automáticamente
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex rounded-lg border border-gray-200 p-1 bg-gray-50">
            <button
              type="button"
              onClick={() => setViewMode('por-pais')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md ${viewMode === 'por-pais' ? 'bg-white shadow-sm text-primary-700' : 'text-gray-600 hover:text-gray-900'}`}
            >
              Por país
            </button>
            <button
              type="button"
              onClick={() => setViewMode('consolidado')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md flex items-center gap-1.5 ${viewMode === 'consolidado' ? 'bg-white shadow-sm text-primary-700' : 'text-gray-600 hover:text-gray-900'}`}
            >
              <Globe size={14} />
              Consolidado (COP)
            </button>
          </div>
          {viewMode === 'por-pais' && (
            <>
              <label className="text-sm font-medium text-gray-700">País:</label>
              <select
                value={countryId}
                onChange={(e) => setCountryId(e.target.value)}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                {data.countries.map((c) => (
                  <option key={c.id} value={c.id}>{c.name} ({c.currency})</option>
                ))}
              </select>
            </>
          )}
          <Link
            to="/contabilidad"
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            ← Contabilidad (Cuadro General)
          </Link>
          {hasChanges && (
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-amber-300 bg-amber-50 text-amber-800 text-sm font-medium hover:bg-amber-100"
            >
              <RotateCcw size={16} />
              Restaurar datos
            </button>
          )}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 text-xs">
            <Calculator size={14} />
            Total = Σ 12 meses
          </div>
          <Link
            to="/analisis"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-600 text-white text-sm font-medium hover:bg-primary-700"
          >
            <BarChart3 size={18} />
            Análisis de datos
          </Link>
        </div>
      </div>

      <ExchangeRatesConfig onRatesChange={setExchangeRates} />

      {viewMode === 'consolidado' ? (
        <div className="card overflow-hidden p-0">
          <div className="px-4 py-3 bg-primary-50/50 border-b border-gray-200">
            <p className="text-sm text-gray-700">
              Valores convertidos a COP según las tasas configuradas. Edita las tasas de cambio arriba para recalcular.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-sm">
              <thead>
                <tr className="bg-gray-100 border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 sticky left-0 bg-gray-100 z-10">CONCEPTO</th>
                  {editableData.countries.map((c) => (
                    <th key={c.id} className="text-right py-3 px-3 font-semibold text-gray-700">
                      {c.name} (COP)
                    </th>
                  ))}
                  <th className="text-right py-3 px-4 font-semibold text-gray-900 bg-primary-50">TOTAL COP</th>
                </tr>
              </thead>
              <tbody>
                {consolidatedData.map((row) => (
                  <tr
                    key={row.concept}
                    className={`border-b border-gray-100 hover:bg-gray-50/50 ${
                      row.concept.includes('UTILIDAD OPERACIONAL') ? 'bg-primary-50/50 font-medium' : ''
                    }`}
                  >
                    <td className="py-2 px-4 pl-8 font-medium text-gray-900 sticky left-0 bg-white">{row.concept}</td>
                    {editableData.countries.map((c) => (
                      <td key={c.id} className="text-right py-2 px-3 tabular-nums text-gray-700">
                        {formatValue(row.byCountry[c.id], row.isMargin)}
                      </td>
                    ))}
                    <td className="text-right py-2 px-4 tabular-nums font-medium text-gray-900 bg-primary-50/30">
                      {formatValue(row.total, row.isMargin)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-sm">
            <thead>
              <tr className="bg-gray-100 border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-900 sticky left-0 bg-gray-100 z-10 min-w-[220px]">
                  CONCEPTO
                </th>
                {MESES_LABEL.map((m) => (
                  <th key={m} className="text-right py-3 px-3 font-semibold text-gray-700 whitespace-nowrap">
                    {m}
                  </th>
                ))}
                <th className="text-right py-3 px-4 font-semibold text-gray-900 bg-primary-50">
                  TOTAL
                </th>
              </tr>
            </thead>
            <tbody>
              {sections.map(({ id, label, rows }) => {
                const isCollapsed = collapsed[id]
                return (
                  <Fragment key={id}>
                    <tr className="bg-gray-50/80 border-b border-gray-200">
                      <td colSpan={MESES_LABEL.length + 2} className="py-2 px-4">
                        <button
                          type="button"
                          onClick={() => toggleSection(id)}
                          className="flex items-center gap-2 w-full text-left font-medium text-gray-800 hover:text-primary-600"
                        >
                          <span className="text-gray-400 select-none">{isCollapsed ? '▶' : '▼'}</span>
                          {label}
                        </button>
                      </td>
                    </tr>
                    {!isCollapsed &&
                      rows.map((row, idx) => {
                        const isMargin = isConceptMargin(row.concept)
                        const isSubtotal = row.concept.includes('UTILIDAD') || (row.concept.includes('GASTOS') && row.concept.includes('OPERACIONAL'))
                        const globalIdx = concepts.indexOf(row)
                        return (
                          <tr
                            key={`${row.concept}-${idx}`}
                            className={`border-b border-gray-100 hover:bg-gray-50/50 ${
                              isSubtotal ? 'bg-gray-50 font-medium' : ''
                            } ${row.concept === 'UTILIDAD OPERACIONAL' ? 'bg-primary-50/50' : ''}`}
                          >
                            <td className="py-2 px-4 pl-8 text-gray-900 sticky left-0 bg-white border-r border-gray-100 font-medium">
                              {row.concept}
                            </td>
                            {MESES.map((mes) => {
                              const cellKey = `${countryId}-${globalIdx}-${mes}`
                              const isEdited = editedCells.has(cellKey)
                              const rawVal = row[mes]
                              return (
                                <td
                                  key={mes}
                                  className={`text-right py-1 px-2 tabular-nums ${
                                    isEdited ? 'bg-amber-50/70 ring-1 ring-amber-200/50' : 'text-gray-700'
                                  }`}
                                >
                                  <input
                                    type="text"
                                    value={rawVal === undefined || rawVal === null ? '' : (isMargin ? String((rawVal * 100).toFixed(1)) : String(rawVal))}
                                    onChange={(e) => {
                                      const v = e.target.value
                                      if (isMargin) {
                                        const pct = v === '' ? 0 : parseFloat(v) / 100
                                        handleCellChange(countryId, globalIdx, mes, isNaN(pct) ? 0 : pct)
                                      } else {
                                        const num = v === '' ? '' : parseFloat(v.replace(/,/g, ''))
                                        handleCellChange(countryId, globalIdx, mes, num === '' ? 0 : (isNaN(Number(num)) ? 0 : Number(num)))
                                      }
                                    }}
                                    className="w-full min-w-[4rem] text-right py-1 px-2 rounded border border-transparent hover:border-gray-300 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 bg-transparent text-sm"
                                  />
                                </td>
                              )
                            })}
                            <td className="text-right py-2 px-4 tabular-nums font-medium text-gray-900 bg-primary-50/30">
                              {formatValue(row.total, isMargin)}
                            </td>
                          </tr>
                        )
                      })}
                  </Fragment>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
      )}
    </div>
  )
}
