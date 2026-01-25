import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

export default api

// Types
export interface Order {
  id: string
  shopifyOrderId: string
  shopifyStoreId: string
  storeName: string
  orderNumber: string
  customerEmail: string
  customerName: string
  totalAmount: number
  currency: string
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  countryCode: string
  country: string
  createdAt: string
  updatedAt: string
  items: OrderItem[]
}

export interface OrderItem {
  id: string
  productId: string
  variantId: string
  sku: string
  title: string
  quantity: number
  price: number
  total: number
}

export interface Transaction {
  id: string
  orderId?: string
  shopId: string
  type: 'sale' | 'refund' | 'expense'
  amount: number
  currency: string
  exchangeRate: number
  baseCurrencyAmount: number
  date: string
  description: string
  category: string
  countryCode: string
}

export interface Shop {
  id: string
  shopifyDomain: string
  shopifyStoreName: string
  countryCode: string
  country: string
  currency: string
  timezone: string
  isActive: boolean
  lastSyncAt: string
  syncStatus: 'success' | 'error' | 'syncing'
  ordersCount: number
}

export interface DashboardStats {
  totalSales: number
  totalOrders: number
  averageTicket: number
  growthRate: number
  salesByCountry: { country: string; amount: number; currency: string }[]
  recentOrders: Order[]
  topProducts: { name: string; quantity: number; revenue: number }[]
}

// API functions
export const ordersApi = {
  getAll: (params?: { status?: string; country?: string; page?: number }) =>
    api.get<Order[]>('/orders', { params }),
  getById: (id: string) => api.get<Order>(`/orders/${id}`),
  updateStatus: (id: string, status: string) =>
    api.patch(`/orders/${id}/status`, { status }),
}

export const accountingApi = {
  getTransactions: (params?: { type?: string; dateFrom?: string; dateTo?: string }) =>
    api.get<Transaction[]>('/accounting/transactions', { params }),
  getBalance: () => api.get('/accounting/reports/balance'),
  getIncomeStatement: (params?: { from?: string; to?: string }) =>
    api.get('/accounting/reports/income', { params }),
}

export const shopifyApi = {
  getShops: () => api.get<Shop[]>('/shopify/shops'),
  syncShop: (id: string) => api.post(`/shopify/shops/${id}/sync`),
  getSyncLogs: () => api.get('/shopify/sync-logs'),
}

export const dashboardApi = {
  getStats: () => api.get<DashboardStats>('/dashboard/stats'),
}
