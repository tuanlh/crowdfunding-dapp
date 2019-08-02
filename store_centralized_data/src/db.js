const redis = require('redis');
require('dotenv').config();
const db = redis.createClient({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD
  });
  
  // Print redis errors to the console
  db.on('error', (err) => {
    console.log("Error " + err);
  });
  
module.exports = db;