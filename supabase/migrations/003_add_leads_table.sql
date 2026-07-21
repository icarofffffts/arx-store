-- ============================================================================
-- ARX Store — Migration 003: Add leads table for capture system
-- ============================================================================

CREATE TABLE IF NOT EXISTS store.leads (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            VARCHAR(256) NOT NULL,
  email           VARCHAR(256),
  discord_server  VARCHAR(256),
  discord_id      VARCHAR(32),
  bot_interest    VARCHAR(50) NOT NULL,  -- 'arx-ticket', 'arx-shop', 'both'
  server_size     VARCHAR(30),           -- 'small', 'medium', 'large'
  message         TEXT,
  status          VARCHAR(30) DEFAULT 'new',  -- new, contacted, converted, lost
  source          VARCHAR(50) DEFAULT 'website', -- website, discord, referral
  utm_campaign    VARCHAR(100),
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_leads_status ON store.leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_bot_interest ON store.leads(bot_interest);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON store.leads(created_at DESC);

ALTER TABLE store.leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "leads_insert_public"
  ON store.leads
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "leads_select_admin"
  ON store.leads
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "leads_update_admin"
  ON store.leads
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);
