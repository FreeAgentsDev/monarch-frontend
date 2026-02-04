import { useState, useCallback, useEffect } from 'react'
import { RotateCcw, Pencil, Calculator } from 'lucide-react'
import { demoStorage, STORAGE_KEYS } from '../../utils/storage'
import { getExchangeRates } from './ExchangeRatesConfig'
import ExchangeRatesConfig from './ExchangeRatesConfig'

const COUNTRY_COLS = ['colombia', 'ecuador', 'espana', 'chile', 'repDominicana', 'costaRica'] as const
const COL_TO_CURRENCY: Record<(typeof COUNTRY_COLS)[number], string> = {
  colombia: 'COP',
  ecuador: 'USD',
  espana: 'EUR',
  chile: 'CLP',
  repDominicana: 'DOP',
  costaRica: 'CRC',
}

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

function deepCloneCuadro(data: CuadroGeneralData): CuadroGeneralData {
  return JSON.parse(JSON.stringify(data))
}

function recalcBlock(block: CuadroBlock, isPesos: boolean): CuadroBlock {
  const monthRows = block.rows.filter((r: CuadroRow) => r.mes !== 'TOTAL')
  const totalRow = block.rows.find((r: CuadroRow) => r.mes === 'TOTAL')
  if (!totalRow) return block

  const next = JSON.parse(JSON.stringify(block))
  monthRows.forEach((_, i) => {
    const r = next.rows[i]
    if (isPesos && r.totalPesos !== undefined) {
      r.totalPesos = COUNTRY_COLS.reduce((s, c) => s + (r[c] || 0), 0)
    }
  })
  const totIdx = next.rows.findIndex((r: CuadroRow) => r.mes === 'TOTAL')
  if (totIdx >= 0) {
    COUNTRY_COLS.forEach((col) => {
      next.rows[totIdx][col] = monthRows.reduce((s, _, i) => s + (next.rows[i][col] || 0), 0)
    })
    if (isPesos && next.rows[totIdx].totalPesos !== undefined) {
      next.rows[totIdx].totalPesos = COUNTRY_COLS.reduce((s, c) => s + (next.rows[totIdx][c] || 0), 0)
    }
  }
  return next
}

export default function CuadroGeneralView({ data }: CuadroGeneralViewProps) {
  const [viewMode, setViewMode] = useState<'local' | 'pesos'>('pesos')
  const [editableData, setEditableData] = useState<CuadroGeneralData>(() => {
    const stored = demoStorage.get<CuadroGeneralData>(STORAGE_KEYS.CUADRO_GENERAL)
    return stored && stored.pesos?.rows?.length ? deepCloneCuadro(stored) : deepCloneCuadro(data)
  })
  const [editedCells, setEditedCells] = useState<Set<string>>(new Set())
  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>(() => getExchangeRates())

  const recalcPesosFromRates = useCallback(() => {
    const local = editableData.local
    if (!local?.rows?.length || !editableData.pesos) return
    setEditableData((prev) => {
      const next = deepCloneCuadro(prev)
      if (!next.pesos || !next.local) return prev
      next.pesos.rows = next.local.rows.map((row: CuadroRow) => {
        const newRow = { ...row }
        COUNTRY_COLS.forEach((col) => {
          const rate = exchangeRates[COL_TO_CURRENCY[col]] ?? 1
          newRow[col] = Math.round((row[col] || 0) * rate)
        })
        newRow.totalPesos = COUNTRY_COLS.reduce((s, c) => s + (newRow[c] || 0), 0)
        return newRow
      })
      return { ...next, pesos: recalcBlock(next.pesos, true) }
    })
  }, [editableData.local, editableData.pesos, exchangeRates])

  useEffect(() => {
    const stored = demoStorage.get<CuadroGeneralData>(STORAGE_KEYS.CUADRO_GENERAL)
    if (stored?.pesos?.rows?.length) {
      setEditableData(deepCloneCuadro(stored))
    } else {
      setEditableData(deepCloneCuadro(data))
    }
    setEditedCells(new Set())
  }, [data])

  useEffect(() => {
    if (editableData.pesos?.rows?.length) {
      demoStorage.set(STORAGE_KEYS.CUADRO_GENERAL, editableData)
    }
  }, [editableData])

  const handleCellChange = useCallback(
    (blockKey: 'local' | 'pesos', rowIdx: number, col: (typeof COUNTRY_COLS)[number], value: number) => {
      const block = editableData[blockKey]
      if (!block || block.rows[rowIdx]?.mes === 'TOTAL') return
      setEditableData((prev) => {
        const next = deepCloneCuadro(prev)
        const b = next[blockKey]
        if (!b) return prev
        b.rows[rowIdx][col] = value
        return { ...next, [blockKey]: recalcBlock(b, blockKey === 'pesos') }
      })
      setEditedCells((prev) => new Set(prev).add(`${blockKey}-${rowIdx}-${col}`))
    },
    []
  )

  const handleReset = useCallback(() => {
    demoStorage.remove(STORAGE_KEYS.CUADRO_GENERAL)
    setEditableData(deepCloneCuadro(data))
    setEditedCells(new Set())
  }, [data])

  const hasLocal = editableData.local && editableData.local.rows.length > 0
  const hasPesos = editableData.pesos && editableData.pesos.rows.length > 0
  const block = viewMode === 'local' ? editableData.local : editableData.pesos
  const rows = block?.rows ?? []
  const showTotalPesos = viewMode === 'pesos' && rows[0] && 'totalPesos' in rows[0]
  const hasChanges = editedCells.size > 0

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">{editableData.title}</h2>
          <p className="text-gray-500 text-sm mt-0.5 flex items-center gap-1.5">
            <Pencil size={14} />
            Edita las celdas — totales y TOTAL se recalculan automáticamente
          </p>
        </div>
        <div className="flex items-center gap-2">
          {hasChanges && (
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-amber-300 bg-amber-50 text-amber-800 text-sm font-medium hover:bg-amber-100"
            >
              <RotateCcw size={16} />
              Restaurar
            </button>
          )}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs">
            <Calculator size={12} />
            Total = Σ países
          </div>
          {editableData.local?.rows?.length && (
            <button
              type="button"
              onClick={recalcPesosFromRates}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-primary-200 bg-primary-50 text-primary-700 hover:bg-primary-100"
            >
              Recalcular pesos
            </button>
          )}
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
              Convertido a {editableData.reportCurrency || 'pesos'}
            </button>
          </div>
        )}
        </div>
      </div>

      <ExchangeRatesConfig onRatesChange={setExchangeRates} compact />

      {viewMode === 'pesos' && (
        <p className="text-xs text-gray-500">
          Tipos de cambio (a COP): {Object.entries(exchangeRates).filter(([, v]) => v > 0).map(([k, v]) => `${k}: ${v}`).join(' · ')}
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
              {rows.map((row, rowIdx) => {
                const isTotal = row.mes === 'TOTAL'
                return (
                  <tr
                    key={row.mes}
                    className={`border-b border-gray-100 hover:bg-gray-50/50 ${isTotal ? 'bg-gray-100 font-semibold' : ''}`}
                  >
                    <td className="py-2 px-4 text-gray-900 sticky left-0 bg-white border-r border-gray-100 font-medium">
                      {row.mes}
                    </td>
                    {COUNTRY_COLS.map((col) => {
                      const cellKey = `${viewMode}-${rowIdx}-${col}`
                      const isEdited = editedCells.has(cellKey)
                      return (
                        <td
                          key={col}
                          className={`text-right py-1 px-2 tabular-nums ${isEdited ? 'bg-amber-50/70 ring-1 ring-amber-200/50' : 'text-gray-700'}`}
                        >
                          {isTotal ? (
                            formatNum(row[col])
                          ) : (
                            <input
                              type="text"
                              value={row[col] ?? ''}
                              onChange={(e) => {
                                const v = e.target.value.replace(/,/g, '')
                                const num = v === '' ? 0 : parseFloat(v)
                                handleCellChange(viewMode, rowIdx, col, isNaN(num) ? 0 : num)
                              }}
                              className="w-full min-w-[4rem] text-right py-1 px-2 rounded border border-transparent hover:border-gray-300 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 bg-transparent text-sm"
                            />
                          )}
                        </td>
                      )
                    })}
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
