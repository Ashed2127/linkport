-- create table for Telegram users
CREATE TABLE IF NOT EXISTS telegram_users (
  id BIGINT PRIMARY KEY,
  username TEXT,
  first_name TEXT,
  last_name TEXT,
  language TEXT,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- create resources table (based on your data.js structure)
CREATE TABLE IF NOT EXISTS resources (
  id SERIAL PRIMARY KEY,
  type TEXT,
  category TEXT,
  name TEXT,
  link TEXT,
  image TEXT
);

-- sample insert: you can also bulk-import from data.js or seed via function
-- INSERT INTO resources (type, category, name, link, image) VALUES ('channel','News','ASHED NEWS','https://t.me/myashed','https://...defaultImage.jpg');
