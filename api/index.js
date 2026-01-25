// Main API router - handles all routes to stay under Vercel's 12 function limit
const { loadData } = require('./utils/data-loader');
const { handleOPTIONS, sendJSON, sendError, parseQuery, parseBody, isValidOrderStatus, isValidTransactionType, paginate, sortArray } = require('./utils/helpers');

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return handleOPTIONS(res);
  }

  try {
    const url = req.url || '';
    const path = url.split('?')[0]; // Remove query string
    const method = req.method;
    const query = parseQuery(req.query || {});
    const body = parseBody(req);

    // Route: /api/orders
    if (path === '/api/orders' || path === '/orders') {
      return handleOrders(req, res, query, body, method);
    }

    // Route: /api/orders/:id
    if (path.match(/^\/api\/orders\/[^/]+$/) || path.match(/^\/orders\/[^/]+$/)) {
      const id = path.split('/').pop();
      return handleOrderById(req, res, id, query, body, method);
    }

    // Route: /api/orders/:id/status
    if (path.match(/^\/api\/orders\/[^/]+\/status$/) || path.match(/^\/orders\/[^/]+\/status$/)) {
      const id = path.split('/')[path.split('/').length - 2];
      return handleOrderStatus(req, res, id, body);
    }

    // Route: /api/dashboard/stats
    if (path === '/api/dashboard/stats' || path === '/dashboard/stats') {
      return handleDashboardStats(req, res);
    }

    // Route: /api/accounting/transactions
    if (path === '/api/accounting/transactions' || path === '/accounting/transactions') {
      return handleTransactions(req, res, query);
    }

    // Route: /api/accounting/reports/balance
    if (path === '/api/accounting/reports/balance' || path === '/accounting/reports/balance') {
      return handleBalanceReport(req, res, query);
    }

    // Route: /api/accounting/reports/income
    if (path === '/api/accounting/reports/income' || path === '/accounting/reports/income') {
      return handleIncomeReport(req, res, query);
    }

    // Route: /api/shopify/shops
    if (path === '/api/shopify/shops' || path === '/shopify/shops') {
      return handleShops(req, res, query, body, method);
    }

    // Route: /api/shopify/shops/:id
    if (path.match(/^\/api\/shopify\/shops\/[^/]+$/) || path.match(/^\/shopify\/shops\/[^/]+$/)) {
      const id = path.split('/').pop();
      return handleShopById(req, res, id, query, body, method);
    }

    // Route: /api/shopify/shops/:id/sync
    if (path.match(/^\/api\/shopify\/shops\/[^/]+\/sync$/) || path.match(/^\/shopify\/shops\/[^/]+\/sync$/)) {
      const id = path.split('/')[path.split('/').length - 2];
      return handleShopSync(req, res, id, body);
    }

    // Route: /api/shopify/sync-logs
    if (path === '/api/shopify/sync-logs' || path === '/shopify/sync-logs') {
      return handleSyncLogs(req, res, query);
    }

    return sendError(res, 404, 'Endpoint not found');
  } catch (error) {
    console.error('Error in API router:', error);
    return sendError(res, 500, `Internal server error: ${error.message}`);
  }
};

// Handler functions
async function handleOrders(req, res, query, body, method) {
  if (method !== 'GET') {
    return sendError(res, 405, 'Method not allowed');
  }

  const data = loadData();
  let orders = [...(data.orders || [])];

  // Apply filters
  if (query.status) {
    if (!isValidOrderStatus(query.status)) {
      return sendError(res, 400, `Invalid status. Must be one of: pending, processing, shipped, delivered, cancelled`);
    }
    orders = orders.filter(order => order.status === query.status);
  }

  if (query.country) {
    orders = orders.filter(order => order.countryCode === query.country);
  }

  if (query.storeId) {
    orders = orders.filter(order => order.shopifyStoreId === query.storeId);
  }

  if (query.customerEmail) {
    orders = orders.filter(order => 
      order.customerEmail && order.customerEmail.toLowerCase().includes(query.customerEmail.toLowerCase())
    );
  }

  if (query.search) {
    const searchTerm = query.search.toLowerCase();
    orders = orders.filter(order => 
      (order.orderNumber && order.orderNumber.toLowerCase().includes(searchTerm)) ||
      (order.customerName && order.customerName.toLowerCase().includes(searchTerm)) ||
      (order.customerEmail && order.customerEmail.toLowerCase().includes(searchTerm))
    );
  }

  if (query.dateFrom) {
    orders = orders.filter(order => order.createdAt && new Date(order.createdAt) >= new Date(query.dateFrom));
  }

  if (query.dateTo) {
    orders = orders.filter(order => order.createdAt && new Date(order.createdAt) <= new Date(query.dateTo));
  }

  if (query.minAmount) {
    orders = orders.filter(order => order.totalAmount >= parseFloat(query.minAmount));
  }

  if (query.maxAmount) {
    orders = orders.filter(order => order.totalAmount <= parseFloat(query.maxAmount));
  }

  if (query.sortBy) {
    orders = sortArray(orders, query.sortBy, query.sortOrder || 'desc');
  } else {
    orders = sortArray(orders, 'createdAt', 'desc');
  }

  if (query.page || query.limit) {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    const result = paginate(orders, page, limit);
    return sendJSON(res, 200, result);
  }

  return sendJSON(res, 200, orders);
}

async function handleOrderById(req, res, id, query, body, method) {
  const data = loadData();
  const order = (data.orders || []).find(o => o.id === id);

  if (!order) {
    return sendError(res, 404, 'Order not found');
  }

  if (method === 'GET') {
    return sendJSON(res, 200, order);
  }

  if (method === 'PATCH') {
    if (body.status && !isValidOrderStatus(body.status)) {
      return sendError(res, 400, `Invalid status. Must be one of: pending, processing, shipped, delivered, cancelled`);
    }

    Object.keys(body).forEach(key => {
      if (key === 'status' || key === 'notes' || key === 'updatedAt') {
        order[key] = body[key];
      }
    });

    order.updatedAt = new Date().toISOString();
    return sendJSON(res, 200, order);
  }

  return sendError(res, 405, 'Method not allowed');
}

async function handleOrderStatus(req, res, id, body) {
  if (req.method !== 'PATCH') {
    return sendError(res, 405, 'Method not allowed. Use PATCH to update status.');
  }

  const data = loadData();
  const { status, notes } = body;

  if (!status) {
    return sendError(res, 400, 'Status is required');
  }

  if (!isValidOrderStatus(status)) {
    return sendError(res, 400, `Invalid status. Must be one of: pending, processing, shipped, delivered, cancelled`);
  }

  const order = (data.orders || []).find(o => o.id === id);
  
  if (!order) {
    return sendError(res, 404, 'Order not found');
  }

  const previousStatus = order.status;
  order.status = status;
  order.updatedAt = new Date().toISOString();

  if (notes) {
    if (!order.notes) {
      order.notes = [];
    }
    order.notes.push({
      text: notes,
      status: status,
      previousStatus: previousStatus,
      createdAt: new Date().toISOString()
    });
  }

  return sendJSON(res, 200, {
    ...order,
    message: `Order status updated from ${previousStatus} to ${status}`
  });
}

async function handleDashboardStats(req, res) {
  if (req.method !== 'GET') {
    return sendError(res, 405, 'Method not allowed');
  }

  const data = loadData();
  const orders = data.orders || [];
  const transactions = data.transactions || [];
  const shops = data.shops || [];

  const salesTransactions = transactions.filter(t => t.type === 'sale');
  const totalSales = salesTransactions.reduce((sum, t) => sum + (t.baseCurrencyAmount || 0), 0);
  const totalOrders = orders.length;
  const averageTicket = totalOrders > 0 ? totalSales / totalOrders : 0;
  const growthRate = 15.5;

  const salesByCountryMap = {};
  orders.forEach(order => {
    const country = order.country || 'Unknown';
    if (!salesByCountryMap[country]) {
      salesByCountryMap[country] = {
        country: country,
        amount: 0,
        currency: order.currency || 'USD',
        ordersCount: 0
      };
    }
    salesByCountryMap[country].amount += (order.totalAmount || 0);
    salesByCountryMap[country].ordersCount += 1;
  });

  const salesByCountry = Object.values(salesByCountryMap);

  const recentOrders = [...orders]
    .filter(o => o.createdAt)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5)
    .map(order => ({
      id: order.id,
      shopifyOrderId: order.shopifyOrderId,
      shopifyStoreId: order.shopifyStoreId,
      storeName: order.storeName,
      orderNumber: order.orderNumber,
      customerEmail: order.customerEmail,
      customerName: order.customerName,
      totalAmount: order.totalAmount,
      currency: order.currency,
      status: order.status,
      countryCode: order.countryCode,
      country: order.country,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      items: []
    }));

  const productMap = {};
  orders.forEach(order => {
    if (order.items && order.items.length > 0) {
      order.items.forEach(item => {
        if (item.title) {
          if (!productMap[item.title]) {
            productMap[item.title] = {
              name: item.title,
              quantity: 0,
              revenue: 0
            };
          }
          productMap[item.title].quantity += (item.quantity || 0);
          productMap[item.title].revenue += (item.total || 0);
        }
      });
    }
  });

  const topProducts = Object.values(productMap)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  const stats = {
    totalSales: totalSales,
    totalOrders: totalOrders,
    averageTicket: averageTicket,
    growthRate: growthRate,
    salesByCountry: salesByCountry,
    recentOrders: recentOrders,
    topProducts: topProducts,
    activeShops: shops.filter(s => s.isActive).length,
    totalShops: shops.length,
    totalTransactions: transactions.length,
    pendingOrders: orders.filter(o => o.status === 'pending').length,
    processingOrders: orders.filter(o => o.status === 'processing').length,
    shippedOrders: orders.filter(o => o.status === 'shipped').length,
    deliveredOrders: orders.filter(o => o.status === 'delivered').length,
    lastUpdated: new Date().toISOString()
  };

  return sendJSON(res, 200, stats);
}

async function handleTransactions(req, res, query) {
  if (req.method !== 'GET') {
    return sendError(res, 405, 'Method not allowed');
  }

  const data = loadData();
  let transactions = [...(data.transactions || [])];

  if (query.type) {
    if (!isValidTransactionType(query.type)) {
      return sendError(res, 400, `Invalid type. Must be one of: sale, refund, expense`);
    }
    transactions = transactions.filter(t => t.type === query.type);
  }

  if (query.category) {
    transactions = transactions.filter(t => 
      t.category && t.category.toLowerCase().includes(query.category.toLowerCase())
    );
  }

  if (query.shopId) {
    transactions = transactions.filter(t => t.shopId === query.shopId);
  }

  if (query.countryCode) {
    transactions = transactions.filter(t => t.countryCode === query.countryCode);
  }

  if (query.orderId) {
    transactions = transactions.filter(t => t.orderId === query.orderId);
  }

  if (query.dateFrom) {
    transactions = transactions.filter(t => t.date && new Date(t.date) >= new Date(query.dateFrom));
  }

  if (query.dateTo) {
    transactions = transactions.filter(t => t.date && new Date(t.date) <= new Date(query.dateTo));
  }

  if (query.minAmount) {
    transactions = transactions.filter(t => t.baseCurrencyAmount >= parseFloat(query.minAmount));
  }

  if (query.maxAmount) {
    transactions = transactions.filter(t => t.baseCurrencyAmount <= parseFloat(query.maxAmount));
  }

  if (query.currency) {
    transactions = transactions.filter(t => t.currency === query.currency.toUpperCase());
  }

  if (query.sortBy) {
    transactions = sortArray(transactions, query.sortBy, query.sortOrder || 'desc');
  } else {
    transactions = sortArray(transactions, 'date', 'desc');
  }

  if (query.page || query.limit) {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    const result = paginate(transactions, page, limit);
    return sendJSON(res, 200, result);
  }

  return sendJSON(res, 200, transactions);
}

async function handleBalanceReport(req, res, query) {
  if (req.method !== 'GET') {
    return sendError(res, 405, 'Method not allowed');
  }

  const data = loadData();
  const { date } = query;
  const cutoffDate = date ? new Date(date) : new Date();

  const transactions = (data.transactions || []).filter(t => t.date && new Date(t.date) <= cutoffDate);

  const assets = transactions
    .filter(t => t.type === 'sale')
    .reduce((sum, t) => sum + (t.baseCurrencyAmount || 0), 0);

  const liabilities = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + (t.baseCurrencyAmount || 0), 0);

  const equity = assets - liabilities;

  const balance = {
    date: cutoffDate.toISOString().split('T')[0],
    assets: { total: assets, current: assets, fixed: 0 },
    liabilities: { total: liabilities, current: liabilities, longTerm: 0 },
    equity: { total: equity, retained: equity, capital: 0 },
    total: assets
  };

  return sendJSON(res, 200, balance);
}

async function handleIncomeReport(req, res, query) {
  if (req.method !== 'GET') {
    return sendError(res, 405, 'Method not allowed');
  }

  const data = loadData();
  const { from, to } = query;
  const startDate = from ? new Date(from) : new Date(new Date().setDate(1));
  const endDate = to ? new Date(to) : new Date();

  const transactions = (data.transactions || []).filter(t => {
    if (!t.date) return false;
    const txDate = new Date(t.date);
    return txDate >= startDate && txDate <= endDate;
  });

  const revenue = transactions
    .filter(t => t.type === 'sale')
    .reduce((sum, t) => sum + (t.baseCurrencyAmount || 0), 0);

  const refunds = transactions
    .filter(t => t.type === 'refund')
    .reduce((sum, t) => sum + (t.baseCurrencyAmount || 0), 0);

  const expenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + (t.baseCurrencyAmount || 0), 0);

  const grossProfit = revenue - refunds;
  const netIncome = grossProfit - expenses;

  const incomeStatement = {
    period: {
      from: startDate.toISOString().split('T')[0],
      to: endDate.toISOString().split('T')[0]
    },
    revenue: {
      sales: revenue,
      refunds: refunds,
      total: grossProfit
    },
    expenses: {
      total: expenses,
      byCategory: transactions
        .filter(t => t.type === 'expense')
        .reduce((acc, t) => {
          const cat = t.category || 'Other';
          acc[cat] = (acc[cat] || 0) + (t.baseCurrencyAmount || 0);
          return acc;
        }, {})
    },
    netIncome: netIncome,
    margin: revenue > 0 ? ((netIncome / revenue) * 100).toFixed(2) : 0
  };

  return sendJSON(res, 200, incomeStatement);
}

async function handleShops(req, res, query, body, method) {
  const data = loadData();

  if (method === 'GET') {
    let shops = [...(data.shops || [])];

    if (query.isActive !== undefined) {
      const isActive = query.isActive === true || query.isActive === 'true';
      shops = shops.filter(s => s.isActive === isActive);
    }

    if (query.countryCode) {
      shops = shops.filter(s => s.countryCode === query.countryCode);
    }

    if (query.syncStatus) {
      shops = shops.filter(s => s.syncStatus === query.syncStatus);
    }

    if (query.currency) {
      shops = shops.filter(s => s.currency === query.currency.toUpperCase());
    }

    if (query.sortBy) {
      shops = sortArray(shops, query.sortBy, query.sortOrder || 'asc');
    }

    if (query.page || query.limit) {
      const page = parseInt(query.page) || 1;
      const limit = parseInt(query.limit) || 10;
      const result = paginate(shops, page, limit);
      return sendJSON(res, 200, result);
    }

    return sendJSON(res, 200, shops);
  }

  if (method === 'POST') {
    if (!body.shopifyDomain || !body.shopifyStoreName) {
      return sendError(res, 400, 'shopifyDomain and shopifyStoreName are required');
    }

    const shop = {
      id: `shop${Date.now()}`,
      shopifyDomain: body.shopifyDomain,
      shopifyStoreName: body.shopifyStoreName,
      countryCode: body.countryCode || 'US',
      country: body.country || 'Estados Unidos',
      currency: body.currency || 'USD',
      timezone: body.timezone || 'America/New_York',
      isActive: body.isActive !== undefined ? body.isActive : true,
      lastSyncAt: null,
      syncStatus: 'syncing',
      ordersCount: 0
    };

    return sendJSON(res, 201, shop);
  }

  return sendError(res, 405, 'Method not allowed');
}

async function handleShopById(req, res, id, query, body, method) {
  const data = loadData();
  const shop = (data.shops || []).find(s => s.id === id);

  if (!shop) {
    return sendError(res, 404, 'Shop not found');
  }

  if (method === 'GET') {
    return sendJSON(res, 200, shop);
  }

  if (method === 'PUT' || method === 'PATCH') {
    Object.keys(body).forEach(key => {
      if (['shopifyStoreName', 'countryCode', 'country', 'currency', 'timezone', 'isActive'].includes(key)) {
        shop[key] = body[key];
      }
    });
    return sendJSON(res, 200, shop);
  }

  if (method === 'DELETE') {
    return sendJSON(res, 200, { 
      message: 'Shop deleted successfully',
      id: id
    });
  }

  return sendError(res, 405, 'Method not allowed');
}

async function handleShopSync(req, res, id, body) {
  if (req.method !== 'POST') {
    return sendError(res, 405, 'Method not allowed. Use POST to sync shop.');
  }

  const data = loadData();
  const { syncType = 'orders' } = body;

  if (!id) {
    return sendError(res, 400, 'Shop ID is required');
  }

  const shop = (data.shops || []).find(s => s.id === id);
  
  if (!shop) {
    return sendError(res, 404, 'Shop not found');
  }

  if (!shop.isActive) {
    return sendError(res, 400, 'Cannot sync inactive shop');
  }

  const startTime = new Date();
  shop.syncStatus = 'syncing';
  shop.lastSyncAt = startTime.toISOString();

  const recordsSynced = Math.floor(Math.random() * 20) + 5;
  const errorsCount = Math.random() > 0.9 ? 1 : 0;

  const syncLog = {
    id: `log${Date.now()}`,
    shopId: id,
    syncType: syncType,
    status: errorsCount > 0 ? 'error' : 'success',
    recordsSynced: recordsSynced,
    errorsCount: errorsCount,
    startedAt: startTime.toISOString(),
    completedAt: new Date().toISOString(),
    errorMessage: errorsCount > 0 ? 'Some records failed to sync' : null
  };

  shop.syncStatus = errorsCount > 0 ? 'error' : 'success';
  shop.lastSyncAt = syncLog.completedAt;
  shop.ordersCount += recordsSynced;

  return sendJSON(res, 200, {
    success: true,
    message: 'Sincronización completada',
    shopId: id,
    syncLog: syncLog,
    shop: shop
  });
}

async function handleSyncLogs(req, res, query) {
  if (req.method !== 'GET') {
    return sendError(res, 405, 'Method not allowed');
  }

  const data = loadData();
  let logs = [...(data.syncLogs || [])];

  if (query.shopId) {
    logs = logs.filter(log => log.shopId === query.shopId);
  }

  if (query.syncType) {
    logs = logs.filter(log => log.syncType === query.syncType);
  }

  if (query.status) {
    logs = logs.filter(log => log.status === query.status);
  }

  if (query.dateFrom) {
    logs = logs.filter(log => log.startedAt && new Date(log.startedAt) >= new Date(query.dateFrom));
  }

  if (query.dateTo) {
    logs = logs.filter(log => log.startedAt && new Date(log.startedAt) <= new Date(query.dateTo));
  }

  if (query.sortBy) {
    logs = sortArray(logs, query.sortBy, query.sortOrder || 'desc');
  } else {
    logs = sortArray(logs, 'startedAt', 'desc');
  }

  if (query.page || query.limit) {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    const result = paginate(logs, page, limit);
    return sendJSON(res, 200, result);
  }

  return sendJSON(res, 200, logs);
}
