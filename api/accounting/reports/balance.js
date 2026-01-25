const { loadData } = require('../../../utils/data-loader');
const { handleOPTIONS, sendJSON, sendError } = require('../../../utils/helpers');

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return handleOPTIONS(res);
  }

  try {
    if (req.method !== 'GET') {
      return sendError(res, 405, 'Method not allowed');
    }

    const data = loadData();
    const { date } = req.query || {};
    const cutoffDate = date ? new Date(date) : new Date();

    const transactions = (data.transactions || []).filter(t => t.date && new Date(t.date) <= cutoffDate);

    // Calculate balances by account type
    const assets = transactions
      .filter(t => t.type === 'sale')
      .reduce((sum, t) => sum + (t.baseCurrencyAmount || 0), 0);

    const liabilities = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + (t.baseCurrencyAmount || 0), 0);

    const equity = assets - liabilities;

    const balance = {
      date: cutoffDate.toISOString().split('T')[0],
      assets: {
        total: assets,
        current: assets,
        fixed: 0
      },
      liabilities: {
        total: liabilities,
        current: liabilities,
        longTerm: 0
      },
      equity: {
        total: equity,
        retained: equity,
        capital: 0
      },
      total: assets
    };

    return sendJSON(res, 200, balance);
  } catch (error) {
    console.error('Error in balance report endpoint:', error);
    return sendError(res, 500, `Internal server error: ${error.message}`);
  }
};
