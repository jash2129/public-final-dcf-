import { pool, setupDatabase } from './server/db.js';

async function test() {
  await setupDatabase();
  try {
    const [rows] = await pool.query('SELECT * FROM coupons');
    console.log(rows);
  } catch (err) {
    console.error("Error:", err);
  } finally {
    process.exit();
  }
}

test();
