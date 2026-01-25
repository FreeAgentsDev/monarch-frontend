const data = require('../../data.json');
const { handleOPTIONS, sendJSON, sendError, parseQuery, isValidTransactionType, paginate, sortArray } = require('../../utils/helpers');

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return handleOPTIONS(res);
  }

  try {
    if (req.method !== 'GET') {
      return sendError(res, 405, 'Method not allowed');
    }

    const query = parseQuery(req.query);
    let transactions = [...data.transactions];

    // Apply filters
    if (query.type) {
      if (!isValidTransactionType(query.type)) {
        return sendError(res, 400, `Invalid type. Must be one of: sale, refund, expense`);
      }
      transactions = transactions.filter(t => t.type === query.type);
    }

    if (query.category) {
      transactions = transactions.filter(t => 
        t.category.toLowerCase().includes(query.category.toLowerCase())
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

    // Date range filters
    if (query.dateFrom) {
      transactions = transactions.filter(t => new Date(t.date) >= new Date(query.dateFrom));
    }

    if (query.dateTo) {
      transactions = transactions.filter(t => new Date(t.date) <= new Date(query.dateTo));
    }

    // Amount range filters
    if (query.minAmount) {
      transactions = transactions.filter(t => t.baseCurrencyAmount >= parseFloat(query.minAmount));
    }

    if (query.maxAmount) {
      transactions = transactions.filter(t => t.baseCurrencyAmount <= parseFloat(query.maxAmount));
    }

    // Currency filter
    if (query.currency) {
      transactions = transactions.filter(t => t.currency === query.currency.toUpperCase());
    }

    // Sorting
    if (query.sortBy) {
      transactions = sortArray(transactions, query.sortBy, query.sortOrder || 'desc');
    } else {
      // Default sort by date desc
      transactions = sortArray(transactions, 'date', 'desc');
    }

    // Pagination
    if (query.page || query.limit) {
      const page = parseInt(query.page) || 1;
      const limit = parseInt(query.limit) || 10;
      const result = paginate(transactions, page, limit);
      return sendJSON(res, 200, result);
    }

    return sendJSON(res, 200, transactions);
  } catch (error) {
    console.error('Error in transactions endpoint:', error);
    return sendError(res, 500, 'Internal server error');
  }
};
