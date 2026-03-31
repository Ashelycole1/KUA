-- Kua users table
-- Run this in your Supabase SQL editor

CREATE TABLE IF NOT EXISTS users (
  id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  phone_number   TEXT UNIQUE NOT NULL,
  credit_balance INT  NOT NULL DEFAULT 3,
  currency_code  TEXT DEFAULT 'KES',
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-update updated_at on row change
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RPC helper used by payment webhook
CREATE OR REPLACE FUNCTION increment_credits(user_phone TEXT, amount INT DEFAULT 10)
RETURNS VOID AS $$
BEGIN
  INSERT INTO users (phone_number, credit_balance)
  VALUES (user_phone, amount)
  ON CONFLICT (phone_number)
  DO UPDATE SET credit_balance = users.credit_balance + amount;
END;
$$ LANGUAGE plpgsql;

-- Index for fast phone lookups
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone_number);
