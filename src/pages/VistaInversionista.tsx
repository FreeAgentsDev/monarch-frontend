import { useParams, Link } from 'react-router-dom'
import { usePaises } from '../hooks/usePaisesInversionistas'
import { Package, Download, FileSpreadsheet, ArrowLeft } from 'lucide-react'
import { useState } from 'react'

/** Catálogo de ejemplo por país (pendiente recibir Excels por país) */
const CATALOGO_EJEMPLO = [
  { sku: 'MON-001', nombre: 'Aro Clásico Dorado', categoria: 'Aros', precioMayorista: 45, moneda: 'USD' },
  { sku: 'MON-002', nombre: 'Collar Esmeralda', categoria: 'Collares', precioMayorista: 120, moneda: 'USD' },
  { sku: 'MON-003', nombre: 'Pulsera Plata', categoria: 'Pulseras', precioMayorista: 35, moneda: 'USD' },
  { sku: 'MON-004', nombre: 'Anillo Brillante', categoria: 'Anillos', precioMayorista: 85, moneda: 'USD' },
  { sku: 'MON-005', nombre: 'Set Pendientes', categoria: 'Pendientes', precioMayorista: 28, moneda: 'USD' },
]

export default function VistaInversionista() {
  const { paisCodigo } = useParams<{ paisCodigo: string }>()
  const { paises } = usePaises()
  const [sinPrecios, setSinPrecios] = useState(false)

  const pais = paises.find((p) => p.codigo.toUpperCase() === (paisCodigo ?? '').toUpperCase()) ?? paises[0]
  const codigo = pais?.codigo ?? paisCodigo ?? 'EC'

  const handleDescargar = (incluirPrecios: boolean) => {
    const filas = CATALOGO_EJEMPLO.map((p) =>
      incluirPrecios
        ? `${p.sku};${p.nombre};${p.categoria};${p.precioMayorista};${p.moneda}`
        : `${p.sku};${p.nombre};${p.categoria}`
    )
    const csv = (incluirPrecios ? 'SKU;Producto;Categoría;Precio mayorista;Moneda\n' : 'SKU;Producto;Categoría\n') + filas.join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `catalogo-${codigo}-${incluirPrecios ? 'con-precios' : 'sin-precios'}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

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
          <h1 className="text-2xl font-bold text-gray-900">
            Vista inversionista · {pais?.nombre ?? codigo}
          </h1>
          <p className="text-gray-600 mt-1">
            Catálogo al por mayor para este país. Descarga con o sin precios (pendiente Excels por país).
          </p>
        </div>
      </div>

      <div className="card bg-amber-50 border-amber-200">
        <p className="text-sm text-amber-800">
          <strong>Pendiente:</strong> Recibir los archivos Excel por país para cargar el catálogo real. Mientras tanto se muestra un catálogo de ejemplo.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => setSinPrecios(false)}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium ${
            !sinPrecios ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
          }`}
        >
          <Package size={18} />
          Catálogo con precios (mayorista)
        </button>
        <button
          type="button"
          onClick={() => setSinPrecios(true)}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium ${
            sinPrecios ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
          }`}
        >
          <FileSpreadsheet size={18} />
          Catálogo sin precios
        </button>
        <button
          type="button"
          onClick={() => handleDescargar(!sinPrecios)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700"
        >
          <Download size={18} />
          Descargar {sinPrecios ? 'sin precios' : 'con precios'} (CSV)
        </button>
      </div>

      <div className="card overflow-hidden p-0">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">
            {sinPrecios ? 'Catálogo sin precios (para compartir)' : 'Catálogo al por mayor'}
          </h2>
          <span className="text-sm text-gray-500">{pais?.nombre} · {pais?.moneda}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left py-3 px-4 font-medium text-gray-700">SKU</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Producto</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Categoría</th>
                {!sinPrecios && (
                  <>
                    <th className="text-right py-3 px-4 font-medium text-gray-700">Precio mayorista</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-700">Moneda</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {CATALOGO_EJEMPLO.map((p) => (
                <tr key={p.sku} className="border-b border-gray-100 hover:bg-gray-50/50">
                  <td className="py-3 px-4 font-mono text-sm text-gray-900">{p.sku}</td>
                  <td className="py-3 px-4 text-gray-900">{p.nombre}</td>
                  <td className="py-3 px-4 text-gray-600">{p.categoria}</td>
                  {!sinPrecios && (
                    <>
                      <td className="py-3 px-4 text-right font-medium">{p.precioMayorista} {p.moneda}</td>
                      <td className="py-3 px-4 text-right text-gray-600">{p.moneda}</td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <h3 className="font-semibold text-gray-900 mb-2">Vistas por país</h3>
        <p className="text-sm text-gray-600 mb-3">Cada país tiene su propia vista de catálogo. Selecciona otro:</p>
        <div className="flex flex-wrap gap-2">
          {paises.filter((p) => p.activo).map((p) => (
            <Link
              key={p.id}
              to={`/inversionistas/vista/${p.codigo}`}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                p.codigo === codigo
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {p.nombre}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
