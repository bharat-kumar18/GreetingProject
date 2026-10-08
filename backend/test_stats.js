const pool = require('./src/config/db');
require('dotenv').config({ path: './.env' });

async function check() {
  try {
    const t = await pool.query('SELECT COUNT(*) FROM templates');
    const r = await pool.query('SELECT COUNT(*) FROM recipients');
    const o = await pool.query('SELECT COUNT(*) FROM generated_outputs');
    console.log(JSON.stringify({
      t: t.rows[0].count,
      r: r.rows[0].count,
      o: o.rows[0].count
    }));
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}
check();
