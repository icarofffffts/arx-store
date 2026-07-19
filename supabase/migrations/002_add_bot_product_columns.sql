-- ============================================================================
-- ARX Store — Migration 002: Add bot product columns to custom_bot_orders
-- ============================================================================

-- Add missing columns that code expects but schema didn't define
ALTER TABLE store.custom_bot_orders
  ADD COLUMN IF NOT EXISTS bot_slug VARCHAR(50),
  ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deployed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS total_price_cents INTEGER,
  ADD COLUMN IF NOT EXISTS duration_months INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS whitelabel BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS ticket_enabled BOOLEAN DEFAULT false;

-- Add new columns for website bot purchases
ALTER TABLE store.custom_bot_orders
  ADD COLUMN IF NOT EXISTS source VARCHAR(30) DEFAULT 'discord',
  ADD COLUMN IF NOT EXISTS bot_name VARCHAR(100),
  ADD COLUMN IF NOT EXISTS plan_type VARCHAR(30) DEFAULT 'monthly',
  ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;

-- Add index for website orders lookup
CREATE INDEX IF NOT EXISTS idx_custom_bot_orders_user_source 
  ON store.custom_bot_orders(user_id, source, bot_slug);

-- Update RLS policy to allow website orders (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'custom_bot_orders_insert_website' 
    AND tablename = 'custom_bot_orders'
    AND schemaname = 'store'
  ) THEN
    CREATE POLICY "custom_bot_orders_insert_website"
      ON store.custom_bot_orders
      FOR INSERT
      TO authenticated
      WITH CHECK (source = 'website');
  END IF;
END $$;
