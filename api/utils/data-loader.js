// Centralized data loader for all serverless functions
const fs = require('fs');
const path = require('path');

let cachedData = null;

function loadData() {
  // Return cached data if available
  if (cachedData) {
    return cachedData;
  }

  try {
    // Try multiple possible paths (for different function locations)
    const possiblePaths = [
      path.join(__dirname, '..', 'data.json'),
      path.join(process.cwd(), 'api', 'data.json'),
      path.join(process.cwd(), 'data.json'),
      path.join(__dirname, 'data.json')
    ];

    for (const dataPath of possiblePaths) {
      try {
        if (fs.existsSync(dataPath)) {
          const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
          cachedData = data;
          return data;
        }
      } catch (err) {
        // Try next path
        continue;
      }
    }

    // If no file found, return empty structure
    console.warn('data.json not found, using empty data structure');
    cachedData = {
      orders: [],
      transactions: [],
      shops: [],
      syncLogs: [],
      dashboardStats: {}
    };
    return cachedData;
  } catch (error) {
    console.error('Error loading data:', error);
    // Return empty structure on error
    return {
      orders: [],
      transactions: [],
      shops: [],
      syncLogs: [],
      dashboardStats: {}
    };
  }
}

module.exports = { loadData };
