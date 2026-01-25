const data = require('../../../data.json');

module.exports = async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    const { id } = req.query;
    const shop = data.shops.find(s => s.id === id);
    
    if (!shop) {
      return res.status(404).json({ error: 'Shop not found' });
    }
    
    // Simulate sync
    shop.lastSyncAt = new Date().toISOString();
    shop.syncStatus = 'success';
    
    return res.status(200).json({
      success: true,
      message: 'Sincronización iniciada',
      shopId: id
    });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
