// functions/getResources.js
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

exports.handler = async function(event) {
  try {
    const client = await pool.connect();
    let rows;
    try {
      const res = await client.query(`SELECT id, type, category, name, link, image FROM resources ORDER BY id`);
      rows = res.rows;
    } finally {
      client.release();
    }

    // If DB is empty, fallback to public/data.js (static) is handled on frontend. Here we return [] if empty.
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(rows)
    };
  } catch (err) {
    console.error("getResources error", err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
