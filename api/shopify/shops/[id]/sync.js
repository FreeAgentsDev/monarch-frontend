const data = require('../../../data.json');
const { handleOPTIONS, sendJSON, sendError } = require('../../../utils/helpers');

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return handleOPTIONS(res);
  }

  try {
    if (req.method !== 'POST') {
      return sendError(res, 405, 'Method not allowed. Use POST to sync shop.');
    }

    const { id } = req.query;
    const { syncType = 'orders' } = req.body || {};

    if (!id) {
      return sendError(res, 400, 'Shop ID is required');
    }

    const shop = data.shops.find(s => s.id === id);
    
    if (!shop) {
      return sendError(res, 404, 'Shop not found');
    }

    if (!shop.isActive) {
      return sendError(res, 400, 'Cannot sync inactive shop');
    }

    // Simulate sync process
    const startTime = new Date();
    
    // Update shop sync status
    shop.syncStatus = 'syncing';
    shop.lastSyncAt = startTime.toISOString();

    // Simulate sync delay (in real app, this would be async)
    const recordsSynced = Math.floor(Math.random() * 20) + 5;
    const errorsCount = Math.random() > 0.9 ? 1 : 0; // 10% chance of error

    // Create sync log
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

    // Update shop after sync
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
  } catch (error) {
    console.error('Error in shop sync endpoint:', error);
    return sendError(res, 500, 'Internal server error');
  }
};
