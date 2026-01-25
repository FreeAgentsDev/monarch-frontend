import data from './data.json';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { query } = req;
  let orders = [...data.orders];

  // Apply filters
  if (query.status) {
    orders = orders.filter(order => order.status === query.status);
  }

  if (query.country) {
    orders = orders.filter(order => order.countryCode === query.country);
  }

  if (req.method === 'GET') {
    // Get single order by ID
    if (query.id || req.url.includes('/orders/')) {
      const orderId = query.id || req.url.split('/orders/')[1]?.split('?')[0];
      const order = data.orders.find(o => o.id === orderId);
      
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }
      
      return res.status(200).json(order);
    }

    // Get all orders
    return res.status(200).json(orders);
  }

  // PATCH for status update
  if (req.method === 'PATCH' && req.url.includes('/status')) {
    const orderId = req.url.split('/orders/')[1]?.split('/status')[0];
    const { status } = req.body;
    
    const order = data.orders.find(o => o.id === orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    order.status = status;
    order.updatedAt = new Date().toISOString();
    
    return res.status(200).json(order);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
