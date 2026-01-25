const data = require('../../../data.json');
const { handleOPTIONS, sendJSON, sendError } = require('../../../utils/helpers');

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return handleOPTIONS(res);
  }

  try {
    if (req.method !== 'GET') {
      return sendError(res, 405, 'Method not allowed');
    }

    const { from, to } = req.query;
    const startDate = from ? new Date(from) : new Date(new Date().setDate(1)); // First day of current month
    const endDate = to ? new Date(to) : new Date();

    const transactions = data.transactions.filter(t => {
      const txDate = new Date(t.date);
      return txDate >= startDate && txDate <= endDate;
    });

    // Calculate income statement
    const revenue = transactions
      .filter(t => t.type === 'sale')
      .reduce((sum, t) => sum + t.baseCurrencyAmount, 0);

    const refunds = transactions
      .filter(t => t.type === 'refund')
      .reduce((sum, t) => sum + t.baseCurrencyAmount, 0);

    const expenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.baseCurrencyAmount, 0);

    const grossProfit = revenue - refunds;
    const netIncome = grossProfit - expenses;

    const incomeStatement = {
      period: {
        from: startDate.toISOString().split('T')[0],
        to: endDate.toISOString().split('T')[0]
      },
      revenue: {
        sales: revenue,
        refunds: refunds,
        total: grossProfit
      },
      expenses: {
        total: expenses,
        byCategory: transactions
          .filter(t => t.type === 'expense')
          .reduce((acc, t) => {
            const cat = t.category || 'Other';
            acc[cat] = (acc[cat] || 0) + t.baseCurrencyAmount;
            return acc;
          }, {})
      },
      netIncome: netIncome,
      margin: revenue > 0 ? ((netIncome / revenue) * 100).toFixed(2) : 0
    };

    return sendJSON(res, 200, incomeStatement);
  } catch (error) {
    console.error('Error in income statement endpoint:', error);
    return sendError(res, 500, 'Internal server error');
  }
};
