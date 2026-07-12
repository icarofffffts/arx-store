-- ============================================================================
-- ARX Store — Initial Schema Migration
-- Schema: store
-- Supabase PostgreSQL
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Schema
-- ----------------------------------------------------------------------------

CREATE SCHEMA IF NOT EXISTS store;

-- ----------------------------------------------------------------------------
-- updated_at trigger function
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION store.trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TABLES
-- ============================================================================

-- ----------------------------------------------------------------------------
-- store.plans — Available subscription plans
-- ----------------------------------------------------------------------------

CREATE TABLE store.plans (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(100)  NOT NULL,
  slug        VARCHAR(50)   UNIQUE NOT NULL,
  price_cents INTEGER       NOT NULL DEFAULT 0,
  max_guilds  INTEGER       NOT NULL DEFAULT 1,
  bot_limit   INTEGER       NOT NULL DEFAULT 1,
  features    JSONB         DEFAULT '[]',
  is_active   BOOLEAN       DEFAULT true,
  created_at  TIMESTAMPTZ   DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- store.users — User accounts with Discord + ARX Auth link
-- ----------------------------------------------------------------------------

CREATE TABLE store.users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  open_id     VARCHAR(128) UNIQUE NOT NULL,
  discord_id  VARCHAR(32)  UNIQUE,
  email       VARCHAR(256),
  name        VARCHAR(256),
  avatar_url  VARCHAR(512),
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TRIGGER set_users_updated_at
  BEFORE UPDATE ON store.users
  FOR EACH ROW EXECUTE FUNCTION store.trigger_set_updated_at();

-- ----------------------------------------------------------------------------
-- store.subscriptions — Active subscriptions with MercadoPago IDs
-- ----------------------------------------------------------------------------

CREATE TABLE store.subscriptions (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              UUID        REFERENCES store.users(id) ON DELETE CASCADE,
  plan_id              INTEGER     REFERENCES store.plans(id),
  mp_preapproval_id    VARCHAR(128),
  mp_subscription_id   VARCHAR(128),
  status               VARCHAR(30) DEFAULT 'pending',
  current_period_start TIMESTAMPTZ,
  current_period_end   TIMESTAMPTZ,
  cancelled_at         TIMESTAMPTZ,
  created_at           TIMESTAMPTZ DEFAULT now(),
  updated_at           TIMESTAMPTZ DEFAULT now()
);

CREATE TRIGGER set_subscriptions_updated_at
  BEFORE UPDATE ON store.subscriptions
  FOR EACH ROW EXECUTE FUNCTION store.trigger_set_updated_at();

-- ----------------------------------------------------------------------------
-- store.guilds — Discord guilds with active bots
-- ----------------------------------------------------------------------------

CREATE TABLE store.guilds (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guild_id        VARCHAR(32)  UNIQUE NOT NULL,
  owner_discord_id VARCHAR(32),
  owner_user_id   UUID        REFERENCES store.users(id) ON DELETE SET NULL,
  name            VARCHAR(256),
  icon            VARCHAR(256),
  member_count    INTEGER     DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- store.guild_bots — Per-guild bot instances with config JSONB, status
-- ----------------------------------------------------------------------------

CREATE TABLE store.guild_bots (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guild_id        UUID        REFERENCES store.guilds(id) ON DELETE CASCADE,
  subscription_id UUID        REFERENCES store.subscriptions(id) ON DELETE SET NULL,
  bot_slug        VARCHAR(50) NOT NULL,
  status          VARCHAR(30) DEFAULT 'active',
  config          JSONB       DEFAULT '{}',
  activated_at    TIMESTAMPTZ DEFAULT now(),
  expires_at      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now(),
  UNIQUE(guild_id, bot_slug)
);

CREATE TRIGGER set_guild_bots_updated_at
  BEFORE UPDATE ON store.guild_bots
  FOR EACH ROW EXECUTE FUNCTION store.trigger_set_updated_at();

-- ----------------------------------------------------------------------------
-- store.invoices — Payment invoices
-- ----------------------------------------------------------------------------

CREATE TABLE store.invoices (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID        REFERENCES store.subscriptions(id) ON DELETE CASCADE,
  user_id         UUID        REFERENCES store.users(id) ON DELETE SET NULL,
  mp_payment_id   VARCHAR(128),
  amount_cents    INTEGER,
  status          VARCHAR(30),
  paid_at         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- store.webhook_logs — Webhook event logs for debugging/auditing
-- ----------------------------------------------------------------------------

CREATE TABLE store.webhook_logs (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source     VARCHAR(50),
  event_type VARCHAR(100),
  payload    JSONB,
  processed  BOOLEAN   DEFAULT false,
  error      TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- store.settings — Global platform settings (key/value)
-- ----------------------------------------------------------------------------

CREATE TABLE store.settings (
  key        VARCHAR(100) PRIMARY KEY,
  value      JSONB       NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TRIGGER set_settings_updated_at
  BEFORE UPDATE ON store.settings
  FOR EACH ROW EXECUTE FUNCTION store.trigger_set_updated_at();

-- ----------------------------------------------------------------------------
-- store.custom_bot_orders — Custom bot creation orders (briefing, quote, status, files)
-- ----------------------------------------------------------------------------

CREATE TABLE store.custom_bot_orders (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              UUID        REFERENCES store.users(id) ON DELETE CASCADE,
  status               VARCHAR(30) DEFAULT 'briefing',
  name                 VARCHAR(256),
  description          TEXT,
  requirements         TEXT,
  price_cents          INTEGER,
  hosting_monthly_cents INTEGER,
  files                JSONB       DEFAULT '[]',
  source_repo_url      VARCHAR(512),
  delivered_at         TIMESTAMPTZ,
  created_at           TIMESTAMPTZ DEFAULT now(),
  updated_at           TIMESTAMPTZ DEFAULT now()
);

CREATE TRIGGER set_custom_bot_orders_updated_at
  BEFORE UPDATE ON store.custom_bot_orders
  FOR EACH ROW EXECUTE FUNCTION store.trigger_set_updated_at();

-- ----------------------------------------------------------------------------
-- store.custom_order_messages — Chat between client and ARX about a custom order
-- ----------------------------------------------------------------------------

CREATE TABLE store.custom_order_messages (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id    UUID        REFERENCES store.custom_bot_orders(id) ON DELETE CASCADE,
  author_type VARCHAR(20) NOT NULL,
  author_id   UUID,
  content     TEXT,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- store.custom_bots — Deployed custom bot instances
-- ----------------------------------------------------------------------------

CREATE TABLE store.custom_bots (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id           UUID        REFERENCES store.custom_bot_orders(id) ON DELETE SET NULL,
  user_id            UUID        REFERENCES store.users(id) ON DELETE CASCADE,
  guild_id           VARCHAR(32),
  bot_token_encrypted TEXT,
  bot_client_id      VARCHAR(32),
  status             VARCHAR(30) DEFAULT 'active',
  config             JSONB       DEFAULT '{}',
  last_restart_at    TIMESTAMPTZ,
  created_at         TIMESTAMPTZ DEFAULT now(),
  updated_at         TIMESTAMPTZ DEFAULT now()
);

CREATE TRIGGER set_custom_bots_updated_at
  BEFORE UPDATE ON store.custom_bots
  FOR EACH ROW EXECUTE FUNCTION store.trigger_set_updated_at();

-- ----------------------------------------------------------------------------
-- store.activation_history — Bot activation/deactivation audit log
-- ----------------------------------------------------------------------------

CREATE TABLE store.activation_history (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guild_bot_id    UUID        REFERENCES store.guild_bots(id) ON DELETE SET NULL,
  guild_id        UUID        REFERENCES store.guilds(id) ON DELETE CASCADE,
  subscription_id UUID        REFERENCES store.subscriptions(id) ON DELETE SET NULL,
  user_id         UUID        REFERENCES store.users(id) ON DELETE SET NULL,
  bot_slug        VARCHAR(50) NOT NULL,
  action          VARCHAR(20) NOT NULL,
  reason          TEXT,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX idx_subscriptions_user_id       ON store.subscriptions(user_id);
CREATE INDEX idx_subscriptions_plan_id       ON store.subscriptions(plan_id);
CREATE INDEX idx_subscriptions_status        ON store.subscriptions(status);
CREATE INDEX idx_subscriptions_mp_preapproval ON store.subscriptions(mp_preapproval_id);

CREATE INDEX idx_guilds_owner_discord_id     ON store.guilds(owner_discord_id);
CREATE INDEX idx_guilds_owner_user_id        ON store.guilds(owner_user_id);
CREATE INDEX idx_guilds_guild_id             ON store.guilds(guild_id);

CREATE INDEX idx_guild_bots_guild_id         ON store.guild_bots(guild_id);
CREATE INDEX idx_guild_bots_subscription_id  ON store.guild_bots(subscription_id);
CREATE INDEX idx_guild_bots_bot_slug         ON store.guild_bots(bot_slug);
CREATE INDEX idx_guild_bots_status           ON store.guild_bots(status);

CREATE INDEX idx_invoices_subscription_id    ON store.invoices(subscription_id);
CREATE INDEX idx_invoices_user_id            ON store.invoices(user_id);
CREATE INDEX idx_invoices_status             ON store.invoices(status);
CREATE INDEX idx_invoices_mp_payment_id      ON store.invoices(mp_payment_id);

CREATE INDEX idx_webhook_logs_source         ON store.webhook_logs(source);
CREATE INDEX idx_webhook_logs_event_type     ON store.webhook_logs(event_type);
CREATE INDEX idx_webhook_logs_created_at     ON store.webhook_logs(created_at DESC);

CREATE INDEX idx_custom_bot_orders_user_id   ON store.custom_bot_orders(user_id);
CREATE INDEX idx_custom_bot_orders_status    ON store.custom_bot_orders(status);

CREATE INDEX idx_custom_order_messages_order ON store.custom_order_messages(order_id);

CREATE INDEX idx_custom_bots_user_id         ON store.custom_bots(user_id);
CREATE INDEX idx_custom_bots_guild_id        ON store.custom_bots(guild_id);
CREATE INDEX idx_custom_bots_order_id        ON store.custom_bots(order_id);

CREATE INDEX idx_activation_history_guild_id     ON store.activation_history(guild_id);
CREATE INDEX idx_activation_history_subscription ON store.activation_history(subscription_id);
CREATE INDEX idx_activation_history_user_id      ON store.activation_history(user_id);
CREATE INDEX idx_activation_history_action       ON store.activation_history(action);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE store.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE store.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE store.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE store.guilds ENABLE ROW LEVEL SECURITY;
ALTER TABLE store.guild_bots ENABLE ROW LEVEL SECURITY;
ALTER TABLE store.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE store.webhook_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE store.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE store.custom_bot_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE store.custom_order_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE store.custom_bots ENABLE ROW LEVEL SECURITY;
ALTER TABLE store.activation_history ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- store.plans — Public read, admin modify
-- ----------------------------------------------------------------------------

CREATE POLICY "plans_select_all"
  ON store.plans
  FOR SELECT
  USING (true);

-- ----------------------------------------------------------------------------
-- store.users — Read/update own profile
-- ----------------------------------------------------------------------------

CREATE POLICY "users_select_own"
  ON store.users
  FOR SELECT
  USING (
    discord_id = current_setting('request.jwt.claims', true)::json->>'sub'
  );

CREATE POLICY "users_update_own"
  ON store.users
  FOR UPDATE
  USING (
    discord_id = current_setting('request.jwt.claims', true)::json->>'sub'
  )
  WITH CHECK (
    discord_id = current_setting('request.jwt.claims', true)::json->>'sub'
  );

-- ----------------------------------------------------------------------------
-- store.subscriptions — Read/update own subscriptions
-- ----------------------------------------------------------------------------

CREATE POLICY "subscriptions_select_own"
  ON store.subscriptions
  FOR SELECT
  USING (
    user_id IN (
      SELECT id FROM store.users
      WHERE discord_id = current_setting('request.jwt.claims', true)::json->>'sub'
    )
  );

CREATE POLICY "subscriptions_update_own"
  ON store.subscriptions
  FOR UPDATE
  USING (
    user_id IN (
      SELECT id FROM store.users
      WHERE discord_id = current_setting('request.jwt.claims', true)::json->>'sub'
    )
  );

CREATE POLICY "subscriptions_insert_auth"
  ON store.subscriptions
  FOR INSERT
  WITH CHECK (
    user_id IN (
      SELECT id FROM store.users
      WHERE discord_id = current_setting('request.jwt.claims', true)::json->>'sub'
    )
  );

-- ----------------------------------------------------------------------------
-- store.guilds — Read/insert for authenticated users
-- ----------------------------------------------------------------------------

CREATE POLICY "guilds_select_own"
  ON store.guilds
  FOR SELECT
  USING (
    owner_discord_id = current_setting('request.jwt.claims', true)::json->>'sub'
  );

CREATE POLICY "guilds_insert_auth"
  ON store.guilds
  FOR INSERT
  WITH CHECK (true);

-- ----------------------------------------------------------------------------
-- store.guild_bots — Read/manage bots on owned guilds
-- ----------------------------------------------------------------------------

CREATE POLICY "guild_bots_select_own"
  ON store.guild_bots
  FOR SELECT
  USING (
    guild_id IN (
      SELECT id FROM store.guilds
      WHERE owner_discord_id = current_setting('request.jwt.claims', true)::json->>'sub'
    )
  );

CREATE POLICY "guild_bots_insert_own"
  ON store.guild_bots
  FOR INSERT
  WITH CHECK (
    guild_id IN (
      SELECT id FROM store.guilds
      WHERE owner_discord_id = current_setting('request.jwt.claims', true)::json->>'sub'
    )
  );

CREATE POLICY "guild_bots_update_own"
  ON store.guild_bots
  FOR UPDATE
  USING (
    guild_id IN (
      SELECT id FROM store.guilds
      WHERE owner_discord_id = current_setting('request.jwt.claims', true)::json->>'sub'
    )
  );

CREATE POLICY "guild_bots_delete_own"
  ON store.guild_bots
  FOR DELETE
  USING (
    guild_id IN (
      SELECT id FROM store.guilds
      WHERE owner_discord_id = current_setting('request.jwt.claims', true)::json->>'sub'
    )
  );

-- ----------------------------------------------------------------------------
-- store.invoices — Read own invoices
-- ----------------------------------------------------------------------------

CREATE POLICY "invoices_select_own"
  ON store.invoices
  FOR SELECT
  USING (
    user_id IN (
      SELECT id FROM store.users
      WHERE discord_id = current_setting('request.jwt.claims', true)::json->>'sub'
    )
  );

-- ----------------------------------------------------------------------------
-- store.webhook_logs — service_role only (no policies = denied for anon/auth)
-- ----------------------------------------------------------------------------
-- No policies created. Accessible only via service_role (server-side).

-- ----------------------------------------------------------------------------
-- store.settings — All authenticated users can read
-- ----------------------------------------------------------------------------

CREATE POLICY "settings_select_auth"
  ON store.settings
  FOR SELECT
  USING (
    current_setting('request.jwt.claims', true) IS NOT NULL
  );

-- ----------------------------------------------------------------------------
-- store.custom_bot_orders — Read/insert own orders
-- ----------------------------------------------------------------------------

CREATE POLICY "custom_bot_orders_select_own"
  ON store.custom_bot_orders
  FOR SELECT
  USING (
    user_id IN (
      SELECT id FROM store.users
      WHERE discord_id = current_setting('request.jwt.claims', true)::json->>'sub'
    )
  );

CREATE POLICY "custom_bot_orders_insert_auth"
  ON store.custom_bot_orders
  FOR INSERT
  WITH CHECK (
    user_id IN (
      SELECT id FROM store.users
      WHERE discord_id = current_setting('request.jwt.claims', true)::json->>'sub'
    )
  );

CREATE POLICY "custom_bot_orders_update_own"
  ON store.custom_bot_orders
  FOR UPDATE
  USING (
    user_id IN (
      SELECT id FROM store.users
      WHERE discord_id = current_setting('request.jwt.claims', true)::json->>'sub'
    )
  );

-- ----------------------------------------------------------------------------
-- store.custom_order_messages — Read/insert on own orders
-- ----------------------------------------------------------------------------

CREATE POLICY "custom_order_messages_select_own"
  ON store.custom_order_messages
  FOR SELECT
  USING (
    order_id IN (
      SELECT id FROM store.custom_bot_orders
      WHERE user_id IN (
        SELECT id FROM store.users
        WHERE discord_id = current_setting('request.jwt.claims', true)::json->>'sub'
      )
    )
  );

CREATE POLICY "custom_order_messages_insert_auth"
  ON store.custom_order_messages
  FOR INSERT
  WITH CHECK (
    order_id IN (
      SELECT id FROM store.custom_bot_orders
      WHERE user_id IN (
        SELECT id FROM store.users
        WHERE discord_id = current_setting('request.jwt.claims', true)::json->>'sub'
      )
    )
  );

-- ----------------------------------------------------------------------------
-- store.custom_bots — Read own hosted bots
-- ----------------------------------------------------------------------------

CREATE POLICY "custom_bots_select_own"
  ON store.custom_bots
  FOR SELECT
  USING (
    user_id IN (
      SELECT id FROM store.users
      WHERE discord_id = current_setting('request.jwt.claims', true)::json->>'sub'
    )
  );

-- ----------------------------------------------------------------------------
-- store.activation_history — Read own activation history
-- ----------------------------------------------------------------------------

CREATE POLICY "activation_history_select_own"
  ON store.activation_history
  FOR SELECT
  USING (
    user_id IN (
      SELECT id FROM store.users
      WHERE discord_id = current_setting('request.jwt.claims', true)::json->>'sub'
    )
  );

-- ============================================================================
-- SEED DATA
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Subscription plans
-- ----------------------------------------------------------------------------

INSERT INTO store.plans (name, slug, price_cents, max_guilds, bot_limit, features) VALUES
(
  'Free',
  'free',
  0,
  1,
  1,
  '[
    {"slug": "shield", "label": "Shield Security"},
    {"slug": "aegis",  "label": "Aegis"}
  ]'::jsonb
),
(
  'Premium',
  'premium',
  2990,
  3,
  5,
  '[
    {"slug": "shield",  "label": "Shield Security"},
    {"slug": "aegis",   "label": "Aegis"},
    {"slug": "ticket",  "label": "ARX Ticket"},
    {"slug": "invite",  "label": "ARX Invite"},
    {"slug": "mod",     "label": "ARX Mod"}
  ]'::jsonb
),
(
  'Enterprise',
  'enterprise',
  7990,
  9999,
  9999,
  '[
    {"slug": "shield",     "label": "Shield Security"},
    {"slug": "aegis",      "label": "Aegis"},
    {"slug": "ticket",     "label": "ARX Ticket"},
    {"slug": "invite",     "label": "ARX Invite"},
    {"slug": "mod",        "label": "ARX Mod"},
    {"slug": "whitelabel", "label": "Whitelabel"}
  ]'::jsonb
);

-- ----------------------------------------------------------------------------
-- Default bots listing (global settings)
-- ----------------------------------------------------------------------------

INSERT INTO store.settings (key, value) VALUES
(
  'default_bots',
  '[
    {
      "slug":        "shield",
      "name":        "Shield Security",
      "description": "Anti-scam, denúncias, consulta de IDs",
      "status":      "active",
      "type":        "standard",
      "category":    "security"
    },
    {
      "slug":        "aegis",
      "name":        "Aegis",
      "description": "Proteção de servidor, blacklist/whitelist",
      "status":      "active",
      "type":        "standard",
      "category":    "security"
    },
    {
      "slug":        "ticket",
      "name":        "ARX Ticket",
      "description": "Sistema de ticket/suporte",
      "status":      "upcoming",
      "type":        "standard",
      "category":    "support"
    },
    {
      "slug":        "invite",
      "name":        "ARX Invite",
      "description": "Sistema de convites com recompensas",
      "status":      "upcoming",
      "type":        "standard",
      "category":    "engagement"
    },
    {
      "slug":        "mod",
      "name":        "ARX Mod",
      "description": "Moderação automática",
      "status":      "upcoming",
      "type":        "standard",
      "category":    "moderation"
    }
  ]'::jsonb
);

-- ----------------------------------------------------------------------------
-- Insert sample webhook_log for testing
-- ----------------------------------------------------------------------------

INSERT INTO store.webhook_logs (source, event_type, payload, processed, created_at) VALUES
(
  'mercadopago_test',
  'subscription_authorized',
  '{
    "action": "subscription_authorized",
    "data": {
      "id": "test-sub-0001",
      "preapproval_id": "test-preapproval-0001"
    },
    "test": true,
    "message": "Sample webhook for testing — safe to delete"
  }'::jsonb,
  true,
  now() - interval '1 hour'
);
