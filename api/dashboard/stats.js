const data = require('../data.json');
const { handleOPTIONS, sendJSON, sendError } = require('../utils/helpers');

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return handleOPTIONS(res);
  }

  try {
    if (req.method !== 'GET') {
      return sendError(res, 405, 'Method not allowed');
    }

    // Calculate real-time stats from data
    const orders = data.orders || [];
    const transactions = data.transactions || [];
    const shops = data.shops || [];

    // Calculate total sales from transactions
    const salesTransactions = transactions.filter(t => t.type === 'sale');
    const totalSales = salesTransactions.reduce((sum, t) => sum + t.baseCurrencyAmount, 0);

    // Calculate total orders
    const totalOrders = orders.length;

    // Calculate average ticket
    const averageTicket = totalOrders > 0 ? totalSales / totalOrders : 0;

    // Calculate growth rate (mock calculation - in real app would compare with previous period)
    const growthRate = 15.5; // This would be calculated from historical data

    // Get sales by country from orders
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
      salesByCountryMap[country].amount += order.totalAmount;
      salesByCountryMap[country].ordersCount += 1;
    });

    const salesByCountry = Object.values(salesByCountryMap);

    // Get recent orders (last 5, sorted by date)
    const recentOrders = [...orders]
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

    // Calculate top products from order items
    const productMap = {};
    orders.forEach(order => {
      if (order.items && order.items.length > 0) {
        order.items.forEach(item => {
          if (!productMap[item.title]) {
            productMap[item.title] = {
              name: item.title,
              quantity: 0,
              revenue: 0
            };
          }
          productMap[item.title].quantity += item.quantity;
          productMap[item.title].revenue += item.total;
        });
      }
    });

    const topProducts = Object.values(productMap)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Build stats object
    const stats = {
      totalSales: totalSales,
      totalOrders: totalOrders,
      averageTicket: averageTicket,
      growthRate: growthRate,
      salesByCountry: salesByCountry,
      recentOrders: recentOrders,
      topProducts: topProducts,
      // Additional stats
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
  } catch (error) {
    console.error('Error in dashboard stats endpoint:', error);
    return sendError(res, 500, 'Internal server error');
  }
};
