import { useEffect, useState, useMemo, Fragment } from 'react'
import { Link } from 'react-router-dom'
import { accountingApi } from '../services/api'
import { BarChart3 } from 'lucide-react'

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

export default function EstadoDeResultados() {
  const [data, setData] = useState<EstadoResultadosData | null>(null)
  const [countryId, setCountryId] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})

  useEffect(() => {
    accountingApi.getEstadoResultados().then((res) => {
      const payload = res.data as EstadoResultadosData
      setData(payload)
      if (payload?.countries?.length) setCountryId(payload.countries[0].id)
    }).catch(console.error).finally(() => setLoading(false))
  }, [])

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Cargando estado de resultados...</div>
      </div>
    )
  }

  const country = data.countries.find((c) => c.id === countryId) || data.countries[0]
  const concepts = country?.concepts || []

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

  const toggleSection = (id: string) => {
    setCollapsed((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Estado de Resultados</h1>
          <p className="text-gray-600 mt-1">Vista por país, con secciones colapsables — similar al Excel</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/contabilidad"
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            ← Contabilidad (Cuadro General)
          </Link>
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
          <Link
            to="/analisis"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-600 text-white text-sm font-medium hover:bg-primary-700"
          >
            <BarChart3 size={18} />
            Análisis de datos
          </Link>
        </div>
      </div>

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
                            {MESES.map((mes) => (
                              <td key={mes} className="text-right py-2 px-3 tabular-nums text-gray-700">
                                {formatValue(row[mes], isMargin)}
                              </td>
                            ))}
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
    </div>
  )
}
