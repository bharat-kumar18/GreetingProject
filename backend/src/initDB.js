const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const pool = require('./config/db');

async function initDB() {
  try {
    const schema = fs.readFileSync(path.resolve(__dirname, '../database/schema.sql'), 'utf-8');
    const sample = fs.readFileSync(path.resolve(__dirname, '../database/sample.sql'), 'utf-8');

    await pool.query(schema);
    console.log('Schema executed successfully.');

    await pool.query(sample);
    console.log('Sample data executed successfully.');
    
    process.exit(0);
  } catch (error) {
    console.error('Database initialization failed:', error);
    process.exit(1);
  }
}

initDB();
