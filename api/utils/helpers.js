// Utility functions for serverless functions

/**
 * Set CORS headers
 */
function setCORSHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Max-Age', '86400');
}

/**
 * Handle OPTIONS request
 */
function handleOPTIONS(res) {
  setCORSHeaders(res);
  return res.status(200).end();
}

/**
 * Send JSON response
 */
function sendJSON(res, statusCode, data) {
  setCORSHeaders(res);
  res.status(statusCode).json(data);
}

/**
 * Send error response
 */
function sendError(res, statusCode, message) {
  setCORSHeaders(res);
  res.status(statusCode).json({ 
    error: message,
    timestamp: new Date().toISOString()
  });
}

/**
 * Parse query parameters
 */
function parseQuery(query) {
  if (!query) return {};
  const parsed = {};
  for (const [key, value] of Object.entries(query)) {
    if (value === 'true') parsed[key] = true;
    else if (value === 'false') parsed[key] = false;
    else if (!isNaN(value) && value !== '' && value !== null) parsed[key] = Number(value);
    else parsed[key] = value;
  }
  return parsed;
}

/**
 * Parse request body safely
 */
function parseBody(req) {
  try {
    if (typeof req.body === 'string') {
      return JSON.parse(req.body);
    }
    return req.body || {};
  } catch (error) {
    return {};
  }
}

/**
 * Validate order status
 */
function isValidOrderStatus(status) {
  return ['pending', 'processing', 'shipped', 'delivered', 'cancelled'].includes(status);
}

/**
 * Validate transaction type
 */
function isValidTransactionType(type) {
  return ['sale', 'refund', 'expense'].includes(type);
}

/**
 * Paginate results
 */
function paginate(array, page = 1, limit = 10) {
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginated = array.slice(startIndex, endIndex);
  
  return {
    data: paginated,
    pagination: {
      page,
      limit,
      total: array.length,
      totalPages: Math.ceil(array.length / limit),
      hasNext: endIndex < array.length,
      hasPrev: page > 1
    }
  };
}

/**
 * Sort array by field
 */
function sortArray(array, sortBy, order = 'asc') {
  if (!array || array.length === 0) return array;
  if (!sortBy) return array;
  
  const sorted = [...array];
  sorted.sort((a, b) => {
    let aVal = a[sortBy];
    let bVal = b[sortBy];
    
    // Handle null/undefined
    if (aVal == null) return 1;
    if (bVal == null) return -1;
    
    // Handle dates
    if (sortBy.includes('At') || sortBy === 'date') {
      aVal = new Date(aVal).getTime();
      bVal = new Date(bVal).getTime();
    }
    
    // Handle numbers
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return order === 'asc' ? aVal - bVal : bVal - aVal;
    }
    
    // Handle strings
    aVal = String(aVal).toLowerCase();
    bVal = String(bVal).toLowerCase();
    if (order === 'asc') {
      return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
    } else {
      return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
    }
  });
  
  return sorted;
}

module.exports = {
  setCORSHeaders,
  handleOPTIONS,
  sendJSON,
  sendError,
  parseQuery,
  parseBody,
  isValidOrderStatus,
  isValidTransactionType,
  paginate,
  sortArray
};
