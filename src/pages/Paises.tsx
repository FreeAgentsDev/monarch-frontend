import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { accountingApi } from '../services/api'
import { BarChart3, FileSpreadsheet, MapPin, Settings } from 'lucide-react'
import { usePaises } from '../hooks/usePaisesInversionistas'

export default function Paises() {
  const { paises } = usePaises()
  const [estadoData, setEstadoData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Cargando países...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Estadísticas por país</h1>
        <p className="text-gray-600 mt-1">
          Vista general de todos los países de la plataforma Monarch (Colombia, Ecuador, España, Chile, Rep. Dom., Perú, México, Guatemala)
        </p>
      </div>

      <div className="flex justify-end mb-4">
        <Link
          to="/gestion-paises"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-600 text-white text-sm font-medium hover:bg-primary-700"
        >
          <Settings size={18} />
          Gestionar países
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {paises
          .sort((a, b) => (a.orden ?? 99) - (b.orden ?? 99))
          .map((pais) => {
            const utilidad = getUtilidadForCountry(pais.codigo)
            const ingresos = getIngresosForCountry(pais.codigo)
            return (
              <div
                key={pais.id}
                className={`card ${!pais.activo ? 'opacity-60' : ''}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
                      <MapPin size={20} className="text-primary-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{pais.nombre}</h3>
                      <p className="text-sm text-gray-500">{pais.moneda}</p>
                    </div>
                  </div>
                  {!pais.activo && (
                    <span className="text-xs px-2 py-1 rounded bg-amber-100 text-amber-800">Próximamente</span>
                  )}
                </div>
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
                  <Link
                    to="/estado-resultados"
                    className="mt-4 inline-flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 font-medium"
                  >
                    <FileSpreadsheet size={16} />
                    Ver estado de resultados
                  </Link>
                )}
              </div>
            )
          })}
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Accesos rápidos</h2>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/gestion-paises"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-600 text-white text-sm font-medium hover:bg-primary-700"
          >
            <Settings size={18} />
            Gestionar países
          </Link>
          <Link
            to="/estado-resultados"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50"
          >
            <FileSpreadsheet size={18} />
            Estado de resultados por país
          </Link>
          <Link
            to="/analisis"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50"
          >
            <BarChart3 size={18} />
            Análisis general
          </Link>
          <Link
            to="/rutas-entregas"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50"
          >
            <MapPin size={18} />
            Rutas de entregas (Ecuador)
          </Link>
        </div>
      </div>
    </div>
  )
}
