import { useState, useEffect } from 'react'
import { ChevronDown, ChevronUp, Coins } from 'lucide-react'
import { demoStorage, STORAGE_KEYS, DEFAULT_EXCHANGE_RATES } from '../../utils/storage'

const CURRENCY_LABELS: Record<string, string> = {
  COP: 'Peso colombiano (base)',
  USD: 'Dólar estadounidense',
  EUR: 'Euro',
  CLP: 'Peso chileno',
  DOP: 'Peso dominicano',
  CRC: 'Colón costarricense',
}

export type ExchangeRates = Record<string, number>

interface ExchangeRatesConfigProps {
  onRatesChange?: (rates: ExchangeRates) => void
  compact?: boolean
}

export function getExchangeRates(): ExchangeRates {
  const stored = demoStorage.get<ExchangeRates>(STORAGE_KEYS.EXCHANGE_RATES)
  return stored && Object.keys(stored).length > 0
    ? { ...DEFAULT_EXCHANGE_RATES, ...stored }
    : { ...DEFAULT_EXCHANGE_RATES }
}

export default function ExchangeRatesConfig({ onRatesChange, compact = false }: ExchangeRatesConfigProps) {
  const [open, setOpen] = useState(false)
  const [rates, setRates] = useState<ExchangeRates>(() => getExchangeRates())

  useEffect(() => {
    const stored = demoStorage.get<ExchangeRates>(STORAGE_KEYS.EXCHANGE_RATES)
    const merged = { ...DEFAULT_EXCHANGE_RATES, ...(stored || {}) }
    setRates(merged)
  }, [])

  const handleChange = (currency: string, value: number) => {
    const next = { ...rates, [currency]: value }
    setRates(next)
    demoStorage.set(STORAGE_KEYS.EXCHANGE_RATES, next)
    onRatesChange?.(next)
  }

  const handleReset = () => {
    demoStorage.remove(STORAGE_KEYS.EXCHANGE_RATES)
    setRates({ ...DEFAULT_EXCHANGE_RATES })
    onRatesChange?.({ ...DEFAULT_EXCHANGE_RATES })
  }

  const ratesList = Object.entries(DEFAULT_EXCHANGE_RATES)

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50/50">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50"
      >
        <div className="flex items-center gap-2">
          <Coins size={18} className="text-primary-600" />
          <span className="font-medium text-gray-900">Configuración de tasas de cambio</span>
          <span className="text-xs text-gray-500">(conversión a COP)</span>
        </div>
        {open ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>
      {open && (
        <div className="px-4 pb-4 pt-2 border-t border-gray-100">
          <div className={`grid gap-4 ${compact ? 'grid-cols-2 sm:grid-cols-3' : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-6'}`}>
            {ratesList.map(([currency, defaultVal]) => (
              <div key={currency}>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  {currency} {currency !== 'COP' && <span className="text-gray-400">→ COP</span>}
                </label>
                <input
                  type="number"
                  value={rates[currency] ?? defaultVal}
                  onChange={(e) => handleChange(currency, parseFloat(e.target.value) || 0)}
                  min={currency === 'COP' ? 1 : 0}
                  step={currency === 'COP' ? 1 : 0.01}
                  disabled={currency === 'COP'}
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
                {currency !== 'COP' && (
                  <p className="text-xs text-gray-400 mt-0.5">{CURRENCY_LABELS[currency] || currency}</p>
                )}
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={handleReset}
            className="mt-3 text-xs text-amber-600 hover:text-amber-700"
          >
            Restaurar tasas por defecto
          </button>
        </div>
      )}
    </div>
  )
}
