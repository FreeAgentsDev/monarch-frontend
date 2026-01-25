const { loadData } = require('../utils/data-loader');
const { handleOPTIONS, sendJSON, sendError, parseBody, isValidOrderStatus } = require('../utils/helpers');

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return handleOPTIONS(res);
  }

  try {
    const data = loadData();
    const { id } = req.query || {};
    
    if (!id) {
      return sendError(res, 400, 'Order ID is required');
    }

    const order = (data.orders || []).find(o => o.id === id);

    if (!order) {
      return sendError(res, 404, 'Order not found');
    }

    if (req.method === 'GET') {
      return sendJSON(res, 200, order);
    }

    if (req.method === 'PATCH') {
      const updates = parseBody(req);
      
      // Validate status if provided
      if (updates.status && !isValidOrderStatus(updates.status)) {
        return sendError(res, 400, `Invalid status. Must be one of: pending, processing, shipped, delivered, cancelled`);
      }

      // Update order fields
      Object.keys(updates).forEach(key => {
        if (key === 'status' || key === 'notes' || key === 'updatedAt') {
          order[key] = updates[key];
        }
      });

      order.updatedAt = new Date().toISOString();

      return sendJSON(res, 200, order);
    }

    return sendError(res, 405, 'Method not allowed');
  } catch (error) {
    console.error('Error in order detail endpoint:', error);
    return sendError(res, 500, `Internal server error: ${error.message}`);
  }
};
