-- Campaigns table to store AI-generated marketing copy
-- Add this in your Supabase SQL editor

CREATE TABLE IF NOT EXISTS campaigns (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_phone   TEXT REFERENCES users(phone_number) ON DELETE CASCADE,
  prompt       TEXT NOT NULL,
  professional TEXT,
  hype         TEXT,
  sheng        TEXT,
  sms          TEXT,
  flyer_url    TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast history lookups by user
CREATE INDEX IF NOT EXISTS idx_campaigns_user_phone ON campaigns(user_phone);
