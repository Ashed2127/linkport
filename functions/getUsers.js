// functions/getUsers.js
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const ADMIN_TOKEN = process.env.ADMIN_TOKEN || "";

exports.handler = async function(event) {
  try {
    // If ADMIN_TOKEN is set, require header 'x-admin-token'
    if (ADMIN_TOKEN) {
      const headerToken = (event.headers && (event.headers["x-admin-token"] || event.headers["X-Admin-Token"])) || "";
      if (!headerToken || headerToken !== ADMIN_TOKEN) {
        return { statusCode: 401, body: "Unauthorized" };
      }
    }

    const client = await pool.connect();
    try {
      const res = await client.query(`SELECT id, username, first_name, last_name, language, joined_at FROM telegram_users ORDER BY joined_at DESC LIMIT 1000`);
      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(res.rows)
      };
    } finally {
      client.release();
    }
  } catch (err) {
    console.error("getUsers error", err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
