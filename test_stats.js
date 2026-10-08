const pool = require('./backend/src/config/db');
require('dotenv').config({ path: './backend/.env' });

async function check() {
  const t = await pool.query('SELECT COUNT(*) FROM templates');
  const r = await pool.query('SELECT COUNT(*) FROM recipients');
  const o = await pool.query('SELECT COUNT(*) FROM generated_outputs');
  console.log({
    t: t.rows[0].count,
    r: r.rows[0].count,
    o: o.rows[0].count
  });
  process.exit(0);
}
check();
