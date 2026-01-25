const { loadData } = require('../../utils/data-loader');
const { handleOPTIONS, sendJSON, sendError, parseQuery, paginate, sortArray } = require('../../utils/helpers');

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return handleOPTIONS(res);
  }

  try {
    if (req.method !== 'GET') {
      return sendError(res, 405, 'Method not allowed');
    }

    const data = loadData();
    const query = parseQuery(req.query || {});
    let logs = [...(data.syncLogs || [])];

    // Apply filters
    if (query.shopId) {
      logs = logs.filter(log => log.shopId === query.shopId);
    }

    if (query.syncType) {
      logs = logs.filter(log => log.syncType === query.syncType);
    }

    if (query.status) {
      logs = logs.filter(log => log.status === query.status);
    }

    // Date range filters
    if (query.dateFrom) {
      logs = logs.filter(log => log.startedAt && new Date(log.startedAt) >= new Date(query.dateFrom));
    }

    if (query.dateTo) {
      logs = logs.filter(log => log.startedAt && new Date(log.startedAt) <= new Date(query.dateTo));
    }

    // Sorting
    if (query.sortBy) {
      logs = sortArray(logs, query.sortBy, query.sortOrder || 'desc');
    } else {
      // Default sort by startedAt desc
      logs = sortArray(logs, 'startedAt', 'desc');
    }

    // Pagination
    if (query.page || query.limit) {
      const page = parseInt(query.page) || 1;
      const limit = parseInt(query.limit) || 10;
      const result = paginate(logs, page, limit);
      return sendJSON(res, 200, result);
    }

    return sendJSON(res, 200, logs);
  } catch (error) {
    console.error('Error in sync logs endpoint:', error);
    return sendError(res, 500, `Internal server error: ${error.message}`);
  }
};
