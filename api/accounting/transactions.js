import data from '../../data.json';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    const { query } = req;
    let transactions = [...data.transactions];

    // Apply filters
    if (query.type) {
      transactions = transactions.filter(t => t.type === query.type);
    }

    if (query.dateFrom) {
      transactions = transactions.filter(t => t.date >= query.dateFrom);
    }

    if (query.dateTo) {
      transactions = transactions.filter(t => t.date <= query.dateTo);
    }

    return res.status(200).json(transactions);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
