const data = require('./data.json');
const { handleOPTIONS, sendJSON, sendError, parseQuery, isValidOrderStatus, paginate, sortArray } = require('./utils/helpers');

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return handleOPTIONS(res);
  }

  try {
    const query = parseQuery(req.query);
    let orders = [...data.orders];

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
        order.customerEmail.toLowerCase().includes(query.customerEmail.toLowerCase())
      );
    }

    if (query.search) {
      const searchTerm = query.search.toLowerCase();
      orders = orders.filter(order => 
        order.orderNumber.toLowerCase().includes(searchTerm) ||
        order.customerName.toLowerCase().includes(searchTerm) ||
        order.customerEmail.toLowerCase().includes(searchTerm)
      );
    }

    // Date range filters
    if (query.dateFrom) {
      orders = orders.filter(order => new Date(order.createdAt) >= new Date(query.dateFrom));
    }

    if (query.dateTo) {
      orders = orders.filter(order => new Date(order.createdAt) <= new Date(query.dateTo));
    }

    // Amount range filters
    if (query.minAmount) {
      orders = orders.filter(order => order.totalAmount >= parseFloat(query.minAmount));
    }

    if (query.maxAmount) {
      orders = orders.filter(order => order.totalAmount <= parseFloat(query.maxAmount));
    }

    // Sorting
    if (query.sortBy) {
      orders = sortArray(orders, query.sortBy, query.sortOrder || 'desc');
    } else {
      // Default sort by createdAt desc
      orders = sortArray(orders, 'createdAt', 'desc');
    }

    // Pagination
    if (query.page || query.limit) {
      const page = parseInt(query.page) || 1;
      const limit = parseInt(query.limit) || 10;
      const result = paginate(orders, page, limit);
      return sendJSON(res, 200, result);
    }

    return sendJSON(res, 200, orders);
  } catch (error) {
    console.error('Error in orders endpoint:', error);
    return sendError(res, 500, 'Internal server error');
  }
};
