import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { accountingApi } from '../services/api'
import { BarChart3, FileSpreadsheet, LayoutGrid, Receipt } from 'lucide-react'
import CuadroGeneralView from '../components/contabilidad/CuadroGeneralView'
import EstadoResultadosView from '../components/contabilidad/EstadoResultadosView'

type TabId = 'cuadro' | 'estado'

const TABS: { id: TabId; label: string; icon: typeof LayoutGrid }[] = [
  { id: 'cuadro', label: 'Cuadro General', icon: LayoutGrid },
  { id: 'estado', label: 'Estado de Resultados', icon: FileSpreadsheet },
]

export default function ContabilidadHub() {
  const [searchParams, setSearchParams] = useSearchParams()
  const tabParam = (searchParams.get('tab') as TabId) || 'cuadro'
  const initialTab: TabId = TABS.some((t) => t.id === tabParam) ? tabParam : 'cuadro'
  const [activeTab, setActiveTab] = useState<TabId>(initialTab)
  const [cuadroData, setCuadroData] = useState<any>(null)
  const [estadoData, setEstadoData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setSearchParams({ tab: activeTab }, { replace: true })
  }, [activeTab, setSearchParams])

  useEffect(() => {
    Promise.all([
      accountingApi.getCuadroGeneral(),
      accountingApi.getEstadoResultados(),
    ])
      .then(([cuadroRes, estadoRes]) => {
        setCuadroData(cuadroRes.data)
        setEstadoData(estadoRes.data)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Cargando contabilidad...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contabilidad</h1>
          <p className="text-gray-600 mt-1">Cuadro general por países y estado de resultados — vista unificada</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/accounting"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50"
          >
            <Receipt size={18} />
            Transacciones
          </Link>
          <Link
            to="/analisis"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-600 text-white text-sm font-medium hover:bg-primary-700"
          >
            <BarChart3 size={18} />
            Análisis de datos
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-1" aria-label="Tabs">
          {TABS.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  isActive
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Tab content */}
      {activeTab === 'cuadro' && cuadroData && (
        <CuadroGeneralView data={cuadroData} />
      )}
      {activeTab === 'estado' && estadoData && (
        <EstadoResultadosView data={estadoData} />
      )}
    </div>
  )
}
