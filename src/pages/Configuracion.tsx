import { useState } from 'react'
import { Settings, Coins, Users } from 'lucide-react'
import ExchangeRatesConfig from '../components/contabilidad/ExchangeRatesConfig'
import PanelGestionUsuarios from '../components/PanelGestionUsuarios'

type TabId = 'general' | 'usuarios'

export default function Configuracion() {
  const [activeTab, setActiveTab] = useState<TabId>('general')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Configuracion</h1>
        <p className="text-gray-600 mt-1">Parametros del sistema, tasas de cambio y gestion de usuarios.</p>
      </div>

      <div className="border-b border-gray-200">
        <nav className="flex gap-1" aria-label="Tabs">
          {([
            { id: 'general' as TabId, label: 'General', icon: Settings },
            { id: 'usuarios' as TabId, label: 'Usuarios', icon: Users },
          ]).map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
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

      {activeTab === 'general' && (
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-lg bg-primary-100 flex items-center justify-center">
              <Coins size={24} className="text-primary-600" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">Tasas de cambio</h2>
              <p className="text-sm text-gray-500">Configuracion de conversion a COP</p>
            </div>
          </div>
          <ExchangeRatesConfig />
        </div>
      )}

      {activeTab === 'usuarios' && <PanelGestionUsuarios />}
    </div>
  )
}
