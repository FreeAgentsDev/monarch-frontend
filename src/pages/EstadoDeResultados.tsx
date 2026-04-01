import { useEffect, useState, useMemo, Fragment, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { accountingApi } from '../services/api'
import { demoStorage, STORAGE_KEYS } from '../utils/storage'
import { usePaises } from '../hooks/usePaisesInversionistas'
import { getExchangeRates } from '../components/contabilidad/ExchangeRatesConfig'
import ExchangeRatesConfig from '../components/contabilidad/ExchangeRatesConfig'
import { BarChart3, RotateCcw, Calculator, Pencil, Globe, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react'
import { parseAccountingNumberInput, parsePercentInput, inputErrorClass } from '../utils/formValidation'

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

interface CatalogDownloadStats {
  conPrecios: number
  sinPrecios: number
  sinInversion: number
  total: number
}

interface StatsData {
  catalogDownloads?: CatalogDownloadStats
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

/** Crea una fila de concepto con todos los meses en 0 a partir de una plantilla */
function emptyConceptsFromTemplate(template: ConceptRow[]): ConceptRow[] {
  return template.map((row) => {
    const r: ConceptRow = { concept: row.concept, section: row.section, total: 0 }
    MESES.forEach((m) => { (r as unknown as Record<string, number>)[m] = 0 })
    return r
  })
}

function getDefaultConceptTemplate(): ConceptRow[] {
  const rows: ConceptRow[] = [
    { concept: 'INGRESO DOLARES', section: 'ingresos', total: 0 },
    { concept: 'INGRESOS PESOS', section: 'ingresos', total: 0 },
    { concept: 'UTILIDAD BRUTA', section: 'utilidad_bruta', total: 0 },
    { concept: 'GASTOS ADM', section: 'gastos_adm', total: 0 },
    { concept: 'UTILIDAD OPERACIONAL', section: 'utilidad_operacional', total: 0 },
  ]
  MESES.forEach((m) => {
    rows.forEach((r) => { (r as unknown as Record<string, number>)[m] = 0 })
  })
  return rows
}

/** Fusiona países de la API con la lista completa de países configurados (Ecuador y todos) */
function mergeCountriesWithPaises(
  apiCountries: CountryData[],
  paises: { codigo: string; nombre: string; moneda: string; orden?: number }[]
): CountryData[] {
  const byId = new Map<string, CountryData>()
  apiCountries.forEach((c) => byId.set(c.id.toLowerCase(), c))
  const template = apiCountries[0]?.concepts?.length ? apiCountries[0].concepts : getDefaultConceptTemplate()
  const sortedPaises = [...paises].sort((a, b) => (a.orden ?? 99) - (b.orden ?? 99))
  return sortedPaises.map((p) => {
    const id = p.codigo.toLowerCase()
    const existing = byId.get(id)
    if (existing) return existing
    return {
      id,
      name: p.nombre,
      currency: p.moneda,
      concepts: emptyConceptsFromTemplate(template),
    }
  })
}

export default function EstadoDeResultados() {
  const { paises } = usePaises()
  const [data, setData] = useState<EstadoResultadosData | null>(null)
  const [editableData, setEditableData] = useState<EstadoResultadosData | null>(null)
  const [countryId, setCountryId] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})
  const [editedCells, setEditedCells] = useState<Set<string>>(new Set())
  const [cellErrors, setCellErrors] = useState<Record<string, string>>({})
  const [viewMode, setViewMode] = useState<'por-pais' | 'consolidado'>('por-pais')
  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>(() => getExchangeRates())
  const [showFormulas, setShowFormulas] = useState(false)
  const [stats, setStats] = useState<StatsData | null>(null)

  useEffect(() => {
    accountingApi.getEstadoResultados().then((res) => {
      const payload = res.data as EstadoResultadosData
      const merged = {
        countries: mergeCountriesWithPaises(payload?.countries ?? [], paises),
      }
      setData(merged)
      const stored = demoStorage.get<EstadoResultadosData>(STORAGE_KEYS.ESTADO_RESULTADOS)
      const toUse = stored?.countries?.length ? deepCloneData(stored) : deepCloneData(merged)
      setEditableData(toUse)
      if (toUse?.countries?.length) setCountryId(toUse.countries[0].id)
    }).catch(console.error).finally(() => setLoading(false))
  }, [paises])

  useEffect(() => {
    const s = demoStorage.get<StatsData>(STORAGE_KEYS.STATS)
    setStats(s ?? null)
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
      setCellErrors({})
    }
  }, [data])

  // Importante: los hooks (useMemo) deben ejecutarse siempre.
  // Usamos valores seguros mientras se cargan los datos.
  const country = editableData?.countries?.find((c) => c.id === countryId) || editableData?.countries?.[0]
  const concepts = country?.concepts || []
  const hasChanges = editedCells.size > 0
  const catalogDownloads: CatalogDownloadStats = stats?.catalogDownloads ?? {
    conPrecios: 0,
    sinPrecios: 0,
    sinInversion: 0,
    total: 0,
  }

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

  if (loading || !data || !editableData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Cargando estado de resultados...</div>
      </div>
    )
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
          <button
            type="button"
            onClick={() => setShowFormulas((v) => !v)}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 text-sm hover:bg-gray-50"
          >
            <HelpCircle size={16} />
            Fórmulas
            {showFormulas ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          <Link
            to="/analisis"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-600 text-white text-sm font-medium hover:bg-primary-700"
          >
            <BarChart3 size={18} />
            Análisis de datos
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card bg-slate-50 border-slate-200">
          <p className="text-xs font-semibold text-slate-500 uppercase mb-1">
            Resultados comerciales · Catálogos
          </p>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-sm text-slate-600">Descargas totales de catálogos</p>
              <p className="mt-1 text-2xl font-bold text-slate-900 tabular-nums">
                {catalogDownloads.total}
              </p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-lg bg-white border border-slate-200 px-3 py-2">
              <p className="text-slate-500">Catálogo con precios</p>
              <p className="mt-0.5 font-semibold text-slate-900 tabular-nums">
                {catalogDownloads.conPrecios}
              </p>
            </div>
            <div className="rounded-lg bg-white border border-slate-200 px-3 py-2">
              <p className="text-slate-500">Catálogo sin precios</p>
              <p className="mt-0.5 font-semibold text-slate-900 tabular-nums">
                {catalogDownloads.sinPrecios}
              </p>
            </div>
            <div className="rounded-lg bg-white border border-slate-200 px-3 py-2 col-span-2">
              <p className="text-slate-500">Catálogo sin inversión (comisiones)</p>
              <p className="mt-0.5 font-semibold text-slate-900 tabular-nums">
                {catalogDownloads.sinInversion}
              </p>
            </div>
          </div>
          <p className="mt-3 text-[11px] text-slate-500">
            Los valores se actualizan automáticamente cada vez que un inversionista descarga el catálogo desde la vista por país.
          </p>
        </div>
      </div>

      {showFormulas && (
        <div className="card bg-slate-50 border-slate-200">
          <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <Calculator size={18} />
            Fórmulas utilizadas
          </h3>
          <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
            <li><strong>Total por concepto:</strong> Total = Enero + Febrero + … + Diciembre</li>
            <li><strong>Consolidado (COP):</strong> Valor en COP = Valor en moneda local × Tipo de cambio a COP</li>
            <li><strong>Total consolidado:</strong> Suma de todos los países convertidos a COP (margenes: promedio)</li>
            <li><strong>Margen %:</strong> Se edita en porcentaje (ej. 28); se guarda como decimal (0,28)</li>
          </ul>
        </div>
      )}

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
                                    inputMode={isMargin ? 'decimal' : 'decimal'}
                                    title={cellErrors[cellKey]}
                                    value={rawVal === undefined || rawVal === null ? '' : (isMargin ? String((rawVal * 100).toFixed(1)) : String(rawVal))}
                                    onChange={(e) => {
                                      const v = e.target.value
                                      if (isMargin) {
                                        const pct = parsePercentInput(v)
                                        if (!pct.ok) {
                                          setCellErrors((prev) => ({ ...prev, [cellKey]: pct.reason }))
                                          return
                                        }
                                        setCellErrors((prev) => {
                                          const n = { ...prev }
                                          delete n[cellKey]
                                          return n
                                        })
                                        handleCellChange(countryId, globalIdx, mes, pct.value)
                                      } else {
                                        const num = parseAccountingNumberInput(v.replace(/,/g, ''))
                                        if (!num.ok) {
                                          setCellErrors((prev) => ({ ...prev, [cellKey]: num.reason }))
                                          return
                                        }
                                        setCellErrors((prev) => {
                                          const n = { ...prev }
                                          delete n[cellKey]
                                          return n
                                        })
                                        handleCellChange(countryId, globalIdx, mes, num.value)
                                      }
                                    }}
                                    className={`w-full min-w-[4rem] text-right py-1 px-2 rounded border border-transparent hover:border-gray-300 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 bg-transparent text-sm ${inputErrorClass(!!cellErrors[cellKey])}`}
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
