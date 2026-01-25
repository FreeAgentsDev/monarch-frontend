const data = require('../../data.json');
const { handleOPTIONS, sendJSON, sendError, isValidOrderStatus } = require('../../utils/helpers');

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return handleOPTIONS(res);
  }

  try {
    if (req.method !== 'PATCH') {
      return sendError(res, 405, 'Method not allowed. Use PATCH to update status.');
    }

    const { id } = req.query;
    const { status, notes } = req.body || {};

    if (!id) {
      return sendError(res, 400, 'Order ID is required');
    }

    if (!status) {
      return sendError(res, 400, 'Status is required');
    }

    if (!isValidOrderStatus(status)) {
      return sendError(res, 400, `Invalid status. Must be one of: pending, processing, shipped, delivered, cancelled`);
    }

    const order = data.orders.find(o => o.id === id);
    
    if (!order) {
      return sendError(res, 404, 'Order not found');
    }

    // Store previous status for history
    const previousStatus = order.status;
    
    // Update status
    order.status = status;
    order.updatedAt = new Date().toISOString();

    // Add notes if provided
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
  } catch (error) {
    console.error('Error in order status endpoint:', error);
    return sendError(res, 500, 'Internal server error');
  }
};
