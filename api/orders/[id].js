const data = require('../data.json');

module.exports = async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { id } = req.query;
  const order = data.orders.find(o => o.id === id);

  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  if (req.method === 'GET') {
    return res.status(200).json(order);
  }

  if (req.method === 'PATCH') {
    const { status } = req.body;
    if (status) {
      order.status = status;
      order.updatedAt = new Date().toISOString();
    }
    return res.status(200).json(order);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
