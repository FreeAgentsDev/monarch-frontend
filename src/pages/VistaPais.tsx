import { useParams, Link } from 'react-router-dom'
import { usePaises } from '../hooks/usePaisesInversionistas'
import { useCatalogo } from '../hooks/useCatalogo'
import { Download, FileSpreadsheet, ArrowLeft, X, Store, Tag, Percent } from 'lucide-react'
import { useMemo, useState } from 'react'
import { demoStorage, STORAGE_KEYS } from '../utils/storage'
import { useAuth } from '../context/AuthContext'

type CatalogType = 'con-precios' | 'sin-precios' | 'sin-inversion'

type CatalogDownloadStats = { conPrecios: number; sinPrecios: number; sinInversion: number; total: number }
type StatsData = { catalogDownloads?: CatalogDownloadStats }

export default function VistaPais() {
  const { paisCodigo } = useParams<{ paisCodigo: string }>()
  const { paises } = usePaises()
  const { productos: catalogoProductos } = useCatalogo()
  const { role } = useAuth()
  const isEmpresario = role === 'empresario'
  const defaultTipo: CatalogType = isEmpresario ? 'sin-inversion' : 'con-precios'
  const [tipo, setTipo] = useState<CatalogType>(defaultTipo)
  const [preview, setPreview] = useState<(typeof catalogoProductos)[number] | null>(null)

  const pais = paises.find((p) => p.codigo.toUpperCase() === (paisCodigo ?? '').toUpperCase()) ?? paises[0]
  const codigo = pais?.codigo ?? paisCodigo ?? 'EC'
  const monedaPais = pais?.moneda ?? 'USD'

  const activosOnly = catalogoProductos.filter((p) => p.activo)

  const data = useMemo(() => {
    return activosOnly.map((p) => {
      const precioPublico = Math.round(p.precioMayorista * 2)
      const comisionPct = 0.2
      const comisionValor = Math.round(precioPublico * comisionPct)
      return { ...p, moneda: monedaPais, precioPublico, comisionPct, comisionValor }
    })
  }, [monedaPais, activosOnly])

  const incrementStats = (t: CatalogType) => {
    const stats = (demoStorage.get<StatsData>(STORAGE_KEYS.STATS) ?? {}) as StatsData
    const current: CatalogDownloadStats = stats.catalogDownloads ?? { conPrecios: 0, sinPrecios: 0, sinInversion: 0, total: 0 }
    if (t === 'con-precios') current.conPrecios += 1
    if (t === 'sin-precios') current.sinPrecios += 1
    if (t === 'sin-inversion') current.sinInversion += 1
    current.total += 1
    demoStorage.set(STORAGE_KEYS.STATS, { ...stats, catalogDownloads: current })
  }

  const handleDescargar = (t: CatalogType) => {
    incrementStats(t)
    const header =
      t === 'con-precios'
        ? 'SKU;Producto;Categoria;Imagen;Precio mayorista;Moneda\n'
        : t === 'sin-precios'
          ? 'SKU;Producto;Categoria;Imagen\n'
          : 'SKU;Producto;Categoria;Imagen;Precio publico;Comision %;Comision valor;Moneda\n'

    const filas = data.map((p) => {
      if (t === 'con-precios') return `${p.sku};${p.nombre};${p.categoria};${p.imagen};${p.precioMayorista};${p.moneda}`
      if (t === 'sin-precios') return `${p.sku};${p.nombre};${p.categoria};${p.imagen}`
      return `${p.sku};${p.nombre};${p.categoria};${p.imagen};${p.precioPublico};${Math.round(p.comisionPct * 100)};${p.comisionValor};${p.moneda}`
    })

    const csv = header + filas.join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `catalogo-${codigo}-${t}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const isSinInversion = tipo === 'sin-inversion'
  const totalCatalogo = data.length
  const ticketPromedio = Math.round(data.reduce((acc, p) => acc + p.precioMayorista, 0) / Math.max(1, data.length))
  const comisionPromedio = Math.round(data.reduce((acc, p) => acc + p.comisionValor, 0) / Math.max(1, data.length))

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-primary-100 bg-gradient-to-r from-primary-50 via-white to-indigo-50 px-6 py-6 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <Link
              to={role === 'admin' ? '/paises' : '/mi-panel'}
              className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-2"
            >
              <ArrowLeft size={16} />
              {role === 'admin' ? 'Volver a Paises' : 'Volver a Mi Panel'}
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">
              Catalogo · {pais?.nombre ?? codigo}
            </h1>
            <p className="text-gray-600 mt-1">
              {isEmpresario
                ? 'Catalogos para venta y difusion. Descarga con o sin precios, o con comisiones sugeridas.'
                : 'Catalogo al por mayor para este pais. Descarga con o sin precios.'}
            </p>
            <div className="mt-3 inline-flex items-center rounded-full border border-primary-200 bg-white/80 px-3 py-1 text-xs font-medium text-primary-700">
              Pais activo: {pais?.nombre ?? codigo} · Moneda: {pais?.moneda}
            </div>
          </div>
          <div className={`grid grid-cols-1 ${isEmpresario ? 'sm:grid-cols-3' : 'sm:grid-cols-2'} gap-3 min-w-0 lg:min-w-[320px]`}>
            <div className="rounded-2xl border border-white bg-white/80 px-4 py-3">
              <p className="text-xs uppercase tracking-wide text-gray-500">Productos</p>
              <p className="text-2xl font-bold text-gray-900">{totalCatalogo}</p>
            </div>
            <div className="rounded-2xl border border-white bg-white/80 px-4 py-3">
              <p className="text-xs uppercase tracking-wide text-gray-500">Mayorista prom.</p>
              <p className="text-2xl font-bold text-gray-900">{ticketPromedio} {monedaPais}</p>
            </div>
            {isEmpresario && (
              <div className="rounded-2xl border border-white bg-white/80 px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-gray-500">Comision prom.</p>
                <p className="text-2xl font-bold text-gray-900">{comisionPromedio} {monedaPais}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setTipo('con-precios')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium ${
              tipo === 'con-precios' ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            <Tag size={18} />
            Con precios (mayorista)
          </button>
          <button
            type="button"
            onClick={() => setTipo('sin-precios')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium ${
              tipo === 'sin-precios' ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            <FileSpreadsheet size={18} />
            Sin precios
          </button>
          {isEmpresario && (
            <button
              type="button"
              onClick={() => setTipo('sin-inversion')}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium ${
                tipo === 'sin-inversion' ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              <Percent size={18} />
              Sin inversion (comisiones)
            </button>
          )}
          <button
            type="button"
            onClick={() => handleDescargar(tipo)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700"
          >
            <Download size={18} />
            Descargar ({tipo})
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="px-5 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">
            {tipo === 'con-precios'
              ? 'Catalogo mayorista'
              : tipo === 'sin-precios'
                ? 'Catalogo sin precios (para compartir)'
                : 'Catalogo sin inversion (comisiones sugeridas)'}
          </h2>
          <span className="text-sm text-gray-500">{pais?.nombre} · {pais?.moneda}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left py-3 px-4 font-medium text-gray-700">Imagen</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">SKU</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Producto</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Categoria</th>
                {tipo === 'con-precios' && (
                  <>
                    <th className="text-right py-3 px-4 font-medium text-gray-700">Precio mayorista</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-700">Moneda</th>
                  </>
                )}
                {isSinInversion && (
                  <>
                    <th className="text-right py-3 px-4 font-medium text-gray-700">Precio publico</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-700">Comision</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-700">Moneda</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {data.map((p) => (
                <tr key={p.sku} className="border-b border-gray-100 hover:bg-primary-50/40">
                  <td className="py-3 px-4">
                    <button
                      type="button"
                      onClick={() => setPreview(p)}
                      className="w-16 h-16 rounded-lg overflow-hidden border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500/40 hover:shadow-sm transition-shadow"
                    >
                      <img src={p.imagen} alt={p.nombre} className="w-full h-full object-cover" />
                    </button>
                  </td>
                  <td className="py-3 px-4 font-mono text-sm text-gray-900">{p.sku}</td>
                  <td className="py-3 px-4">
                    <div className="text-gray-900 font-semibold">{p.nombre}</div>
                    <div className="text-xs text-gray-500 mt-0.5">Catalogo Kevin Jewelry</div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
                      {p.categoria}
                    </span>
                  </td>
                  {tipo === 'con-precios' && (
                    <>
                      <td className="py-3 px-4 text-right font-medium">{p.precioMayorista} {p.moneda}</td>
                      <td className="py-3 px-4 text-right text-gray-600">{p.moneda}</td>
                    </>
                  )}
                  {isSinInversion && (
                    <>
                      <td className="py-3 px-4 text-right font-medium">{p.precioPublico} {p.moneda}</td>
                      <td className="py-3 px-4 text-right text-gray-700">
                        {Math.round(p.comisionPct * 100)}% ({p.comisionValor} {p.moneda})
                      </td>
                      <td className="py-3 px-4 text-right text-gray-600">{p.moneda}</td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
          <Store size={18} />
          Vistas por pais
        </h3>
        <p className="text-sm text-gray-600 mb-3">Selecciona otro pais:</p>
        <div className="flex flex-wrap gap-2">
          {paises.filter((p) => p.activo).map((p) => (
            <Link
              key={p.id}
              to={`/catalogo/${p.codigo}`}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                p.codigo === codigo ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {p.nombre}
            </Link>
          ))}
        </div>
      </div>

      {preview && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60" onClick={() => setPreview(null)}>
          <div className="relative w-full max-w-lg mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setPreview(null)}
              className="absolute top-3 right-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80 focus:outline-none focus:ring-2 focus:ring-white/60"
            >
              <X size={18} />
            </button>
            <div className="bg-gray-900">
              <img src={preview.imagen} alt={preview.nombre} className="w-full h-80 object-cover" />
            </div>
            <div className="p-5 space-y-2">
              <h3 className="text-lg font-semibold text-gray-900">{preview.nombre}</h3>
              <p className="text-sm text-gray-500">SKU {preview.sku} · {preview.categoria}</p>
              <p className="text-xs text-gray-500">
                Catalogo Kevin Jewelry para {pais?.nombre ?? codigo}.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
