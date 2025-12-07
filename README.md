# linkport
# LinkPort — Netlify + Neon (Telegram directory)

This repo deploys to Netlify (static frontend + serverless functions) and uses Neon (Postgres) for persistent storage.

## Steps
1. Push this repo to GitHub.
2. Create a Netlify site and connect to the repo.
3. Integrate Neon in Netlify (or create Neon DB and provide DATABASE_URL).
4. In Netlify Site settings -> Environment Variables, add:
   - `DATABASE_URL` (Postgres connection string from Neon)
   - `TELEGRAM_BOT_TOKEN` (Telegram Bot token)
   - optional: `ADMIN_TOKEN` (random secret to protect admin endpoint)
5. Run the SQL in `migrations.sql` in Neon to create tables (use Neon dashboard or psql).
6. Deploy — then set Telegram webhook:
