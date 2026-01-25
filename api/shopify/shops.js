const { loadData } = require('../../utils/data-loader');
const { handleOPTIONS, sendJSON, sendError, parseQuery, parseBody, paginate, sortArray } = require('../../utils/helpers');

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return handleOPTIONS(res);
  }

  try {
    const data = loadData();
    
    if (req.method === 'GET') {
      const query = parseQuery(req.query || {});
      let shops = [...(data.shops || [])];

      // Apply filters
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

      // Sorting
      if (query.sortBy) {
        shops = sortArray(shops, query.sortBy, query.sortOrder || 'asc');
      }

      // Pagination
      if (query.page || query.limit) {
        const page = parseInt(query.page) || 1;
        const limit = parseInt(query.limit) || 10;
        const result = paginate(shops, page, limit);
        return sendJSON(res, 200, result);
      }

      return sendJSON(res, 200, shops);
    }

    if (req.method === 'POST') {
      // Create new shop (mock - in real app would validate and save)
      const newShop = parseBody(req);
      
      if (!newShop.shopifyDomain || !newShop.shopifyStoreName) {
        return sendError(res, 400, 'shopifyDomain and shopifyStoreName are required');
      }

      const shop = {
        id: `shop${Date.now()}`,
        shopifyDomain: newShop.shopifyDomain,
        shopifyStoreName: newShop.shopifyStoreName,
        countryCode: newShop.countryCode || 'US',
        country: newShop.country || 'Estados Unidos',
        currency: newShop.currency || 'USD',
        timezone: newShop.timezone || 'America/New_York',
        isActive: newShop.isActive !== undefined ? newShop.isActive : true,
        lastSyncAt: null,
        syncStatus: 'syncing',
        ordersCount: 0
      };

      return sendJSON(res, 201, shop);
    }

    return sendError(res, 405, 'Method not allowed');
  } catch (error) {
    console.error('Error in shops endpoint:', error);
    return sendError(res, 500, `Internal server error: ${error.message}`);
  }
};
