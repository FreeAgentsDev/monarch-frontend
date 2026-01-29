// API service using static JSON files
// All data is loaded from /api/*.json files in the public folder

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
  activeShops?: number
  totalShops?: number
  totalTransactions?: number
  pendingOrders?: number
  processingOrders?: number
  shippedOrders?: number
  deliveredOrders?: number
  lastUpdated?: string
}

// Helper function to load JSON files
async function loadJSON<T>(path: string): Promise<T> {
  const response = await fetch(path)
  if (!response.ok) {
    throw new Error(`Failed to load ${path}: ${response.statusText}`)
  }
  return response.json()
}

// Helper function to create axios-like response
function createResponse<T>(data: T) {
  return {
    data,
    status: 200,
    statusText: 'OK',
    headers: {},
    config: {},
  }
}

// Helper function to filter orders
function filterOrders(orders: Order[], params?: { status?: string; country?: string; page?: number; limit?: number; storeId?: string; customerEmail?: string; search?: string; dateFrom?: string; dateTo?: string; minAmount?: string; maxAmount?: string; sortBy?: string; sortOrder?: string }): Order[] {
  let filtered = [...orders]

  if (params?.status) {
    filtered = filtered.filter(order => order.status === params.status)
  }

  if (params?.country) {
    filtered = filtered.filter(order => order.countryCode === params.country)
  }

  if (params?.storeId) {
    filtered = filtered.filter(order => order.shopifyStoreId === params.storeId)
  }

  if (params?.customerEmail) {
    filtered = filtered.filter(order =>
      order.customerEmail?.toLowerCase().includes(params.customerEmail!.toLowerCase())
    )
  }

  if (params?.search) {
    const searchTerm = params.search.toLowerCase()
    filtered = filtered.filter(order =>
      order.orderNumber?.toLowerCase().includes(searchTerm) ||
      order.customerName?.toLowerCase().includes(searchTerm) ||
      order.customerEmail?.toLowerCase().includes(searchTerm)
    )
  }

  if (params?.dateFrom) {
    filtered = filtered.filter(order => order.createdAt && new Date(order.createdAt) >= new Date(params.dateFrom!))
  }

  if (params?.dateTo) {
    filtered = filtered.filter(order => order.createdAt && new Date(order.createdAt) <= new Date(params.dateTo!))
  }

  if (params?.minAmount) {
    filtered = filtered.filter(order => order.totalAmount >= parseFloat(params.minAmount!))
  }

  if (params?.maxAmount) {
    filtered = filtered.filter(order => order.totalAmount <= parseFloat(params.maxAmount!))
  }

  // Sorting
  if (params?.sortBy) {
    const sortOrder = params.sortOrder || 'desc'
    filtered.sort((a, b) => {
      const aVal = (a as any)[params.sortBy!]
      const bVal = (b as any)[params.sortBy!]
      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1
      return 0
    })
  } else {
    // Default sort by createdAt desc
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }

  // Pagination
  if (params?.page || params?.limit) {
    const page = params.page || 1
    const limit = params.limit || 10
    const start = (page - 1) * limit
    const end = start + limit
    return filtered.slice(start, end)
  }

  return filtered
}

// Helper function to filter transactions
function filterTransactions(transactions: Transaction[], params?: { type?: string; dateFrom?: string; dateTo?: string; category?: string; shopId?: string; countryCode?: string; orderId?: string; minAmount?: string; maxAmount?: string; currency?: string; sortBy?: string; sortOrder?: string; page?: number; limit?: number }): Transaction[] {
  let filtered = [...transactions]

  if (params?.type) {
    filtered = filtered.filter(t => t.type === params.type)
  }

  if (params?.category) {
    filtered = filtered.filter(t =>
      t.category?.toLowerCase().includes(params.category!.toLowerCase())
    )
  }

  if (params?.shopId) {
    filtered = filtered.filter(t => t.shopId === params.shopId)
  }

  if (params?.countryCode) {
    filtered = filtered.filter(t => t.countryCode === params.countryCode)
  }

  if (params?.orderId) {
    filtered = filtered.filter(t => t.orderId === params.orderId)
  }

  if (params?.dateFrom) {
    filtered = filtered.filter(t => t.date && new Date(t.date) >= new Date(params.dateFrom!))
  }

  if (params?.dateTo) {
    filtered = filtered.filter(t => t.date && new Date(t.date) <= new Date(params.dateTo!))
  }

  if (params?.minAmount) {
    filtered = filtered.filter(t => t.baseCurrencyAmount >= parseFloat(params.minAmount!))
  }

  if (params?.maxAmount) {
    filtered = filtered.filter(t => t.baseCurrencyAmount <= parseFloat(params.maxAmount!))
  }

  if (params?.currency) {
    filtered = filtered.filter(t => t.currency === params.currency!.toUpperCase())
  }

  // Sorting
  if (params?.sortBy) {
    const sortOrder = params.sortOrder || 'desc'
    filtered.sort((a, b) => {
      const aVal = (a as any)[params.sortBy!]
      const bVal = (b as any)[params.sortBy!]
      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1
      return 0
    })
  } else {
    // Default sort by date desc
    filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }

  // Pagination
  if (params?.page || params?.limit) {
    const page = params.page || 1
    const limit = params.limit || 10
    const start = (page - 1) * limit
    const end = start + limit
    return filtered.slice(start, end)
  }

  return filtered
}

// Helper function to filter shops
function filterShops(shops: Shop[], params?: { isActive?: boolean | string; countryCode?: string; syncStatus?: string; currency?: string; sortBy?: string; sortOrder?: string; page?: number; limit?: number }): Shop[] {
  let filtered = [...shops]

  if (params?.isActive !== undefined) {
    const isActive = params.isActive === true || params.isActive === 'true'
    filtered = filtered.filter(s => s.isActive === isActive)
  }

  if (params?.countryCode) {
    filtered = filtered.filter(s => s.countryCode === params.countryCode)
  }

  if (params?.syncStatus) {
    filtered = filtered.filter(s => s.syncStatus === params.syncStatus)
  }

  if (params?.currency) {
    filtered = filtered.filter(s => s.currency === params.currency!.toUpperCase())
  }

  // Sorting
  if (params?.sortBy) {
    const sortOrder = params.sortOrder || 'asc'
    filtered.sort((a, b) => {
      const aVal = (a as any)[params.sortBy!]
      const bVal = (b as any)[params.sortBy!]
      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1
      return 0
    })
  }

  // Pagination
  if (params?.page || params?.limit) {
    const page = params.page || 1
    const limit = params.limit || 10
    const start = (page - 1) * limit
    const end = start + limit
    return filtered.slice(start, end)
  }

  return filtered
}

// Cache for loaded data
let ordersCache: Order[] | null = null
let transactionsCache: Transaction[] | null = null
let shopsCache: Shop[] | null = null
let dashboardStatsCache: DashboardStats | null = null
let syncLogsCache: any[] | null = null

// API functions
export const ordersApi = {
  getAll: async (params?: { status?: string; country?: string; page?: number; limit?: number; storeId?: string; customerEmail?: string; search?: string; dateFrom?: string; dateTo?: string; minAmount?: string; maxAmount?: string; sortBy?: string; sortOrder?: string }) => {
    if (!ordersCache) {
      ordersCache = await loadJSON<Order[]>('/api/orders.json')
    }
    const filtered = filterOrders(ordersCache, params)
    return createResponse(filtered)
  },
  getById: async (id: string) => {
    if (!ordersCache) {
      ordersCache = await loadJSON<Order[]>('/api/orders.json')
    }
    const order = ordersCache.find(o => o.id === id)
    if (!order) {
      throw new Error(`Order with id ${id} not found`)
    }
    return createResponse(order)
  },
  updateStatus: async (id: string, status: string) => {
    if (!ordersCache) {
      ordersCache = await loadJSON<Order[]>('/api/orders.json')
    }
    const order = ordersCache.find(o => o.id === id)
    if (!order) {
      throw new Error(`Order with id ${id} not found`)
    }
    // Update in memory (for demo purposes)
    order.status = status as Order['status']
    order.updatedAt = new Date().toISOString()
    return createResponse(order)
  },
}

export const accountingApi = {
  getTransactions: async (params?: { type?: string; dateFrom?: string; dateTo?: string; category?: string; shopId?: string; countryCode?: string; orderId?: string; minAmount?: string; maxAmount?: string; currency?: string; sortBy?: string; sortOrder?: string; page?: number; limit?: number }) => {
    if (!transactionsCache) {
      transactionsCache = await loadJSON<Transaction[]>('/api/accounting/transactions.json')
    }
    const filtered = filterTransactions(transactionsCache, params)
    return createResponse(filtered)
  },
  getBalance: async () => {
    return createResponse(await loadJSON('/api/accounting/reports/balance.json'))
  },
  getIncomeStatement: async (_params?: { from?: string; to?: string }) => {
    // For now, return the static income statement
    // In a real app, you might want to calculate this from transactions
    return createResponse(await loadJSON('/api/accounting/reports/income.json'))
  },
  getEstadoResultados: async () => {
    return createResponse(await loadJSON('/api/accounting/estado-resultados.json'))
  },
  getCuadroGeneral: async () => {
    return createResponse(await loadJSON('/api/accounting/cuadro-general.json'))
  },
}

export const shopifyApi = {
  getShops: async (params?: { isActive?: boolean | string; countryCode?: string; syncStatus?: string; currency?: string; sortBy?: string; sortOrder?: string; page?: number; limit?: number }) => {
    if (!shopsCache) {
      shopsCache = await loadJSON<Shop[]>('/api/shopify/shops.json')
    }
    const filtered = filterShops(shopsCache, params)
    return createResponse(filtered)
  },
  syncShop: async (id: string) => {
    // Mock sync - just return success
    // In a real app, this would trigger an actual sync
    if (!shopsCache) {
      shopsCache = await loadJSON<Shop[]>('/api/shopify/shops.json')
    }
    const shop = shopsCache.find(s => s.id === id)
    if (!shop) {
      throw new Error(`Shop with id ${id} not found`)
    }
    // Simulate sync
    shop.syncStatus = 'syncing'
    shop.lastSyncAt = new Date().toISOString()
    setTimeout(() => {
      shop.syncStatus = 'success'
      shop.ordersCount += Math.floor(Math.random() * 20) + 5
    }, 1000)
    return createResponse({
      success: true,
      message: 'Sincronización iniciada',
      shopId: id,
      shop: shop
    })
  },
  getSyncLogs: async () => {
    if (!syncLogsCache) {
      syncLogsCache = await loadJSON('/api/shopify/sync-logs.json')
    }
    return createResponse(syncLogsCache)
  },
}

export const dashboardApi = {
  getStats: async () => {
    if (!dashboardStatsCache) {
      dashboardStatsCache = await loadJSON<DashboardStats>('/api/dashboard/stats.json')
    }
    return createResponse(dashboardStatsCache)
  },
}

// Export default for backward compatibility (if needed)
export default {
  get: async <T>(url: string, _config?: any) => {
    // This is a fallback for any direct api calls
    const path = url.startsWith('/') ? url : `/${url}`
    const data = await loadJSON<T>(`${path}.json`)
    return createResponse(data)
  },
}
