import { useEffect, useState } from 'react'
import { Store, RefreshCw, CheckCircle, XCircle, Clock, Globe, ShoppingBag } from 'lucide-react'
import { shopifyApi, Shop } from '../services/api'
import { format } from 'date-fns'

const statusColors = {
  success: 'bg-green-100 text-green-800',
  error: 'bg-red-100 text-red-800',
  syncing: 'bg-blue-100 text-blue-800',
}

const statusIcons = {
  success: CheckCircle,
  error: XCircle,
  syncing: Clock,
}

export default function Shopify() {
  const [shops, setShops] = useState<Shop[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState<string | null>(null)

  useEffect(() => {
    loadShops()
  }, [])

  const loadShops = async () => {
    try {
      const response = await shopifyApi.getShops()
      setShops(response.data)
    } catch (error) {
      console.error('Error loading shops:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSync = async (shopId: string) => {
    setSyncing(shopId)
    try {
      await shopifyApi.syncShop(shopId)
      // Reload shops after sync
      setTimeout(() => {
        loadShops()
        setSyncing(null)
      }, 2000)
    } catch (error) {
      console.error('Error syncing shop:', error)
      setSyncing(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Cargando tiendas...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Integración Shopify</h1>
          <p className="text-gray-600 mt-1">
            Gestiona y monitorea tus tiendas Shopify conectadas
          </p>
        </div>
        <button className="btn-primary flex items-center space-x-2">
          <Store size={18} />
          <span>Agregar Tienda</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Tiendas Totales</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{shops.length}</p>
            </div>
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
              <Store className="w-6 h-6 text-primary-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Tiendas Activas</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {shops.filter((s) => s.isActive).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Pedidos</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {shops.reduce((sum, s) => sum + s.ordersCount, 0).toLocaleString('es-ES')}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <ShoppingBag className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Países</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {new Set(shops.map((s) => s.countryCode)).size}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Globe className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Shops Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {shops.map((shop) => {
          const StatusIcon = statusIcons[shop.syncStatus]
          return (
            <div key={shop.id} className="card">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                      <Store className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{shop.shopifyStoreName}</h3>
                      <p className="text-sm text-gray-500">{shop.shopifyDomain}</p>
                    </div>
                  </div>
                </div>
                <span
                  className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
                    statusColors[shop.syncStatus]
                  }`}
                >
                  <StatusIcon className="w-3 h-3 mr-1" />
                  {shop.syncStatus === 'success'
                    ? 'Conectado'
                    : shop.syncStatus === 'error'
                    ? 'Error'
                    : 'Sincronizando'}
                </span>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">País:</span>
                  <span className="font-medium text-gray-900">{shop.country}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Moneda:</span>
                  <span className="font-medium text-gray-900">{shop.currency}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Pedidos:</span>
                  <span className="font-medium text-gray-900">{shop.ordersCount.toLocaleString('es-ES')}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Última Sincronización:</span>
                  <span className="font-medium text-gray-900">
                    {shop.lastSyncAt
                      ? format(new Date(shop.lastSyncAt), 'dd MMM HH:mm')
                      : 'Nunca'}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-4 border-t border-gray-200">
                <button
                  onClick={() => handleSync(shop.id)}
                  disabled={syncing === shop.id || !shop.isActive}
                  className="flex-1 btn-secondary flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <RefreshCw
                    className={`w-4 h-4 ${syncing === shop.id ? 'animate-spin' : ''}`}
                  />
                  <span>{syncing === shop.id ? 'Sincronizando...' : 'Sincronizar'}</span>
                </button>
                <button className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                  Ver Detalles
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Info Box */}
      <div className="card bg-blue-50 border-blue-200">
        <div className="flex items-start space-x-3">
          <div className="w-5 h-5 text-blue-600 mt-0.5">
            <Store className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-blue-900 mb-1">Integración Mock</h3>
            <p className="text-sm text-blue-800">
              Actualmente el sistema está usando datos simulados. La integración real con Shopify
              se implementará en la Fase 5 del proyecto. Los datos mostrados son de ejemplo para
              demostrar la funcionalidad del sistema.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
