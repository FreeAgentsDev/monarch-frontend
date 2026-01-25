import data from '../../data.json';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    return res.status(200).json(data.shops);
  }

  // POST for sync (mock)
  if (req.method === 'POST' && req.url.includes('/sync')) {
    const shopId = req.url.split('/shops/')[1]?.split('/sync')[0];
    const shop = data.shops.find(s => s.id === shopId);
    
    if (!shop) {
      return res.status(404).json({ error: 'Shop not found' });
    }
    
    // Simulate sync
    shop.lastSyncAt = new Date().toISOString();
    shop.syncStatus = 'success';
    
    return res.status(200).json({
      success: true,
      message: 'Sincronización iniciada',
      shopId: shopId
    });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
