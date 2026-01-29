import { useState } from 'react'

interface CuadroRow {
  mes: string
  colombia: number
  ecuador: number
  espana: number
  chile: number
  repDominicana: number
  costaRica: number
  totalPesos?: number
}

interface CuadroBlock {
  columns: string[]
  rows: CuadroRow[]
}

interface CuadroGeneralData {
  title: string
  year?: number
  reportCurrency?: string
  exchangeRates?: Record<string, number>
  local?: CuadroBlock
  pesos?: CuadroBlock
}

interface CuadroGeneralViewProps {
  data: CuadroGeneralData
}

function formatNum(n: number): string {
  return n.toLocaleString('es-ES', { maximumFractionDigits: 0 })
}

export default function CuadroGeneralView({ data }: CuadroGeneralViewProps) {
  const [viewMode, setViewMode] = useState<'local' | 'pesos'>('pesos')

  const hasLocal = data.local && data.local.rows.length > 0
  const hasPesos = data.pesos && data.pesos.rows.length > 0
  const block = viewMode === 'local' ? data.local : data.pesos
  const rows = block?.rows ?? []
  const showTotalPesos = viewMode === 'pesos' && rows[0] && 'totalPesos' in rows[0]

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-gray-900">{data.title}</h2>
        {hasLocal && hasPesos && (
          <div className="flex rounded-lg border border-gray-200 p-1 bg-gray-50">
            <button
              type="button"
              onClick={() => setViewMode('local')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                viewMode === 'local' ? 'bg-white text-primary-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Moneda local
            </button>
            <button
              type="button"
              onClick={() => setViewMode('pesos')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                viewMode === 'pesos' ? 'bg-white text-primary-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Convertido a {data.reportCurrency || 'pesos'}
            </button>
          </div>
        )}
      </div>

      {data.exchangeRates && Object.keys(data.exchangeRates).length > 0 && viewMode === 'pesos' && (
        <p className="text-xs text-gray-500">
          Tipos de cambio: {Object.entries(data.exchangeRates).map(([k, v]) => `${k}: ${v}`).join(' · ')}
        </p>
      )}

      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-sm">
            <thead>
              <tr className="bg-gray-100 border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-900 sticky left-0 bg-gray-100 z-10">MES</th>
                <th className="text-right py-3 px-3 font-semibold text-gray-700">Colombia</th>
                <th className="text-right py-3 px-3 font-semibold text-gray-700">Ecuador</th>
                <th className="text-right py-3 px-3 font-semibold text-gray-700">España</th>
                <th className="text-right py-3 px-3 font-semibold text-gray-700">Chile</th>
                <th className="text-right py-3 px-3 font-semibold text-gray-700">Rep. Dom.</th>
                <th className="text-right py-3 px-3 font-semibold text-gray-700">Costa Rica</th>
                {showTotalPesos && (
                  <th className="text-right py-3 px-4 font-semibold text-gray-900 bg-primary-50">TOTAL PESOS</th>
                )}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const isTotal = row.mes === 'TOTAL'
                return (
                  <tr
                    key={row.mes}
                    className={`border-b border-gray-100 hover:bg-gray-50/50 ${isTotal ? 'bg-gray-100 font-semibold' : ''}`}
                  >
                    <td className="py-2 px-4 text-gray-900 sticky left-0 bg-white border-r border-gray-100 font-medium">
                      {row.mes}
                    </td>
                    <td className="text-right py-2 px-3 tabular-nums text-gray-700">{formatNum(row.colombia)}</td>
                    <td className="text-right py-2 px-3 tabular-nums text-gray-700">{formatNum(row.ecuador)}</td>
                    <td className="text-right py-2 px-3 tabular-nums text-gray-700">{formatNum(row.espana)}</td>
                    <td className="text-right py-2 px-3 tabular-nums text-gray-700">{formatNum(row.chile)}</td>
                    <td className="text-right py-2 px-3 tabular-nums text-gray-700">{formatNum(row.repDominicana)}</td>
                    <td className="text-right py-2 px-3 tabular-nums text-gray-700">{formatNum(row.costaRica)}</td>
                    {showTotalPesos && row.totalPesos !== undefined && (
                      <td className="text-right py-2 px-4 tabular-nums font-medium text-gray-900 bg-primary-50/30">
                        {formatNum(row.totalPesos)}
                      </td>
                    )}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
