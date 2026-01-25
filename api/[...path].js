// Catch-all route handler for all API endpoints
// This single function handles all API routes to stay under Vercel's 12 function limit
const indexHandler = require('./index.js');

module.exports = indexHandler;
