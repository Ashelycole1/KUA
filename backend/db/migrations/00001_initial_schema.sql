-- Initial Schema for Kua MVP Platform
-- Handles general accounts, campaigns, ambassadors, and payouts

CREATE TABLE IF NOT EXISTS users (
  id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  clerk_id       TEXT UNIQUE,
  email          TEXT UNIQUE,
  phone_number   TEXT UNIQUE,
  first_name     TEXT,
  last_name      TEXT,
  biz_name       TEXT,
  credit_balance INT  NOT NULL DEFAULT 10,
  balance        NUMERIC(10,2) DEFAULT 0.0,
  currency_code  TEXT DEFAULT 'KES',
  account_type   TEXT DEFAULT 'merchant',
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS users_updated_at ON users;
CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TABLE IF NOT EXISTS campaigns (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_phone   TEXT REFERENCES users(phone_number) ON DELETE CASCADE,
  prompt       TEXT NOT NULL,
  tone         TEXT,
  professional TEXT,
  hype         TEXT,
  sheng        TEXT,
  sms          TEXT,
  ambassador_message TEXT,
  flyer_url    TEXT,
  platform_schedule JSONB,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_clerk ON users(clerk_id);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone_number);
CREATE INDEX IF NOT EXISTS idx_campaigns_user_phone ON campaigns(user_phone);

CREATE TABLE IF NOT EXISTS ambassadors (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  merchant_phone TEXT REFERENCES users(phone_number) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  phone         TEXT NOT NULL,
  payout_method TEXT DEFAULT 'mtn',
  assigned_groups INT DEFAULT 1,
  clicks        INT DEFAULT 0,
  sales         INT DEFAULT 0,
  total_earned  NUMERIC(10,2) DEFAULT 0.0,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payouts (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ambassador_id UUID REFERENCES ambassadors(id) ON DELETE CASCADE,
  amount        NUMERIC(10,2) NOT NULL,
  status        TEXT DEFAULT 'completed',
  created_at    TIMESTAMPTZ DEFAULT NOW()
);
