import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { accountingApi, Transaction } from '../services/api'
import { BarChart3, FileSpreadsheet, LayoutGrid, Receipt, Download, Filter } from 'lucide-react'
import CuadroGeneralView from '../components/contabilidad/CuadroGeneralView'
import EstadoResultadosView from '../components/contabilidad/EstadoResultadosView'
import { format } from 'date-fns'

type TabId = 'cuadro' | 'estado' | 'transacciones'

const TABS: { id: TabId; label: string; icon: typeof LayoutGrid }[] = [
  { id: 'cuadro', label: 'Cuadro General', icon: LayoutGrid },
  { id: 'estado', label: 'Estado de Resultados', icon: FileSpreadsheet },
  { id: 'transacciones', label: 'Transacciones', icon: Receipt },
]

const typeLabels: Record<Transaction['type'], string> = {
  sale: 'Venta',
  refund: 'Reembolso',
  expense: 'Gasto',
}

function csvEscape(value: string | number): string {
  const s = String(value)
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`
  return s
}

function downloadTransactionsCsv(rows: Transaction[]) {
  const headers = ['Fecha', 'Tipo', 'Descripcion', 'Moneda', 'Monto original', 'Tipo de cambio', 'Monto base (USD)', 'Pais', 'Categoria', 'ID pedido', 'Tienda (shopId)']
  const lines = [
    headers.map(csvEscape).join(','),
    ...rows.map((t) =>
      [format(new Date(t.date), 'yyyy-MM-dd'), typeLabels[t.type], t.description, t.currency, t.amount.toFixed(2), t.exchangeRate.toString(), t.baseCurrencyAmount.toFixed(2), t.countryCode, t.category, t.orderId ?? '', t.shopId].map(csvEscape).join(',')
    ),
  ]
  const blob = new Blob(['\uFEFF' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `contabilidad_${format(new Date(), 'yyyy-MM-dd_HHmm')}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export default function Contabilidad() {
  const [searchParams, setSearchParams] = useSearchParams()
  const tabParam = (searchParams.get('tab') as TabId) || 'cuadro'
  const initialTab: TabId = TABS.some((t) => t.id === tabParam) ? tabParam : 'cuadro'
  const [activeTab, setActiveTab] = useState<TabId>(initialTab)
  const [cuadroData, setCuadroData] = useState<any>(null)
  const [estadoData, setEstadoData] = useState<any>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [typeFilter, setTypeFilter] = useState<string>('all')

  useEffect(() => {
    setSearchParams({ tab: activeTab }, { replace: true })
  }, [activeTab, setSearchParams])

  useEffect(() => {
    Promise.all([
      accountingApi.getCuadroGeneral(),
      accountingApi.getEstadoResultados(),
      accountingApi.getTransactions(),
    ])
      .then(([cuadroRes, estadoRes, transRes]) => {
        setCuadroData(cuadroRes.data)
        setEstadoData(estadoRes.data)
        setTransactions(transRes.data)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (activeTab === 'transacciones') {
      const params = typeFilter !== 'all' ? { type: typeFilter } : {}
      accountingApi.getTransactions(params).then((r) => setTransactions(r.data)).catch(console.error)
    }
  }, [typeFilter, activeTab])

  const totalRevenue = transactions.filter((t) => t.type === 'sale').reduce((sum, t) => sum + t.baseCurrencyAmount, 0)
  const totalExpenses = transactions.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.baseCurrencyAmount, 0)
  const netIncome = totalRevenue - totalExpenses

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-pulse text-gray-400">Cargando contabilidad...</div></div>

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Contabilidad</h1>
          <p className="page-subtitle">Cuadro general, estado de resultados y transacciones.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/estado-resultados" className="btn-secondary">
            <FileSpreadsheet size={16} /> Editor avanzado
          </Link>
          <Link to="/analisis" className="btn-primary">
            <BarChart3 size={16} /> Analisis
          </Link>
        </div>
      </div>

      <nav className="tab-nav">
        {TABS.map((tab) => {
          const Icon = tab.icon
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`tab-btn ${activeTab === tab.id ? 'tab-active' : 'tab-inactive'}`}>
              <Icon size={16} /> {tab.label}
            </button>
          )
        })}
      </nav>

      {activeTab === 'cuadro' && cuadroData && <CuadroGeneralView data={cuadroData} />}
      {activeTab === 'estado' && estadoData && <EstadoResultadosView data={estadoData} />}

      {activeTab === 'transacciones' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="kpi">
              <p className="kpi-label">Ingresos Totales</p>
              <p className="kpi-value text-emerald-600">${totalRevenue.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</p>
            </div>
            <div className="kpi">
              <p className="kpi-label">Gastos Totales</p>
              <p className="kpi-value text-red-600">${totalExpenses.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</p>
            </div>
            <div className="kpi">
              <p className="kpi-label">Utilidad Neta</p>
              <p className={`kpi-value ${netIncome >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>${netIncome.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</p>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Filter className="text-gray-400" size={20} />
                <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                  <option value="all">Todos los tipos</option>
                  <option value="sale">Ventas</option>
                  <option value="refund">Reembolsos</option>
                  <option value="expense">Gastos</option>
                </select>
              </div>
              <button type="button" className="btn-primary flex items-center space-x-2" onClick={() => downloadTransactionsCsv(transactions)} disabled={transactions.length === 0}>
                <Download size={18} /><span>Exportar</span>
              </button>
            </div>
          </div>

          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descripcion</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Monto Original</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Monto Base (USD)</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pais</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transactions.length === 0 ? (
                    <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">No se encontraron transacciones</td></tr>
                  ) : (
                    transactions.map((t) => (
                      <tr key={t.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{format(new Date(t.date), 'dd MMM yyyy')}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${t.type === 'sale' ? 'bg-green-100 text-green-800' : t.type === 'refund' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>{typeLabels[t.type]}</span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">{t.description}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{t.currency} {t.amount.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${t.baseCurrencyAmount.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{t.countryCode}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
