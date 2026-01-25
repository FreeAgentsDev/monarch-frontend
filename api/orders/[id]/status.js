const data = require('../../data.json');

module.exports = async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'PATCH') {
    const { id } = req.query;
    const { status } = req.body;
    
    const order = data.orders.find(o => o.id === id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    order.status = status;
    order.updatedAt = new Date().toISOString();
    
    return res.status(200).json(order);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
