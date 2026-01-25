const { loadData } = require('../../utils/data-loader');
const { handleOPTIONS, sendJSON, sendError, parseBody } = require('../../utils/helpers');

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return handleOPTIONS(res);
  }

  try {
    const data = loadData();
    const { id } = req.query || {};

    if (!id) {
      return sendError(res, 400, 'Shop ID is required');
    }

    const shop = (data.shops || []).find(s => s.id === id);

    if (!shop) {
      return sendError(res, 404, 'Shop not found');
    }

    if (req.method === 'GET') {
      return sendJSON(res, 200, shop);
    }

    if (req.method === 'PUT' || req.method === 'PATCH') {
      const updates = parseBody(req);
      
      // Update shop fields
      Object.keys(updates).forEach(key => {
        if (['shopifyStoreName', 'countryCode', 'country', 'currency', 'timezone', 'isActive'].includes(key)) {
          shop[key] = updates[key];
        }
      });

      return sendJSON(res, 200, shop);
    }

    if (req.method === 'DELETE') {
      // In real app, would actually delete
      return sendJSON(res, 200, { 
        message: 'Shop deleted successfully',
        id: id
      });
    }

    return sendError(res, 405, 'Method not allowed');
  } catch (error) {
    console.error('Error in shop detail endpoint:', error);
    return sendError(res, 500, `Internal server error: ${error.message}`);
  }
};
