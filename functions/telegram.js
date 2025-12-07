// functions/telegram.js
const fetch = require("node-fetch");
const { Pool } = require("pg");

// Use DATABASE_URL provided by Netlify/Neon integration
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // for Neon in many setups you need SSL but if Netlify provides connection string with SSL params it's fine.
  ssl: { rejectUnauthorized: false }
});

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "";

exports.handler = async function(event) {
  try {
    if (event.httpMethod !== "POST") {
      return { statusCode: 405, body: "Method Not Allowed" };
    }

    const update = JSON.parse(event.body || "{}");
    const message = update.message || update.edited_message || (update.callback_query && update.callback_query.message);

    if (!message || !message.from) {
      return { statusCode: 200, body: JSON.stringify({ ok: true, note: "no message" }) };
    }

    const u = message.from;
    const id = u.id;
    const username = u.username || null;
    const first_name = u.first_name || null;
    const last_name = u.last_name || null;
    const language = u.language_code || null;

    const client = await pool.connect();
    try {
      await client.query(
        `INSERT INTO telegram_users (id, username, first_name, last_name, language)
         VALUES ($1,$2,$3,$4,$5)
         ON CONFLICT (id) DO UPDATE
           SET username = EXCLUDED.username,
               first_name = EXCLUDED.first_name,
               last_name = EXCLUDED.last_name,
               language = EXCLUDED.language`,
        [id, username, first_name, last_name, language]
      );
    } finally {
      client.release();
    }

    // Optional: respond to /start
    if (message.text && message.text.trim().toLowerCase().startsWith("/start")) {
      const chatId = message.chat && message.chat.id ? message.chat.id : id;
      await sendTelegramMessage(chatId, "Welcome — your Telegram info has been saved to LinkPort!");
    }

    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  } catch (err) {
    console.error("telegram handler error:", err);
    return { statusCode: 500, body: JSON.stringify({ ok: false, error: err.message }) };
  }
};

async function sendTelegramMessage(chat_id, text) {
  if (!TELEGRAM_BOT_TOKEN) return;
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id, text })
    });
    return res.json();
  } catch (e) {
    console.error("sendTelegramMessage error", e);
  }
}
