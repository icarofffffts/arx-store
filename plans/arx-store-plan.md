# ARX Store — Plano de Arquitetura

## Visão Geral

Plataforma SaaS de bots Discord. Clientes se registram, escolhem um plano (Free/Premium/Enterprise), assinam via MercadoPago, adicionam bots aos seus servidores e gerenciam tudo via dashboard web + bot Manager no Discord.

### Bots disponíveis (produtos)

| Bot | Status | Tipo | Descrição |
|---|---|---|---|
| **Shield Security** | Já existe | Padrão ARX | Anti-scam, denúncias, consulta de IDs |
| **Aegis** | Já existe | Padrão ARX | Proteção de servidor, blacklist/whitelist |
| **ARX Ticket** | A criar | Padrão ARX | Sistema de ticket/suporte |
| **ARX Invite** | A criar | Padrão ARX | Sistema de convites com recompensas |
| **ARX Mod** | A criar | Padrão ARX | Moderação automática |
| **Bot Personalizado** | Sob demanda | Sob medida | Cliente especifica, ARX constrói e entrega |

### Planos
| Plano | Preço mensal | Bots incluídos | Guilds |
|---|---|---|---|
| **Free** | R$ 0 | 1 bot (Shield ou Aegis) | 1 servidor |
| **Premium** | R$ 29,90 | Todos os bots | 3 servidores |
| **Enterprise** | R$ 79,90 | Todos os bots + whitelabel | Ilimitado |

---

## Arquitetura

```
┌────────────────────────────────────────────────────────────────┐
│                         ARX Store                               │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│  📱 Dashboard (Next.js 14 App Router)                           │
│     auth.arxdevs.xyz/login  →  JWT centralizado                 │
│     ├ /dashboard             → Meus bots, status                │
│     ├ /dashboard/servidores  → Gerenciar guilds                 │
│     ├ /planos                → Escolher/upgrade de plano         │
│     ├ /faturamento           → Histórico, faturas               │
│     └ /admin                 → Gerenciar usuários, bots         │
│                                                                 │
│  🤖 Bot Manager (discord.js + @magicyan/discord)                │
│     ├ /loja          → Ver bots disponíveis                     │
│     ├ /meuplano      → Status da assinatura                     │
│     ├ /ativar        → Ativar bot no servidor                   │
│     ├ /config        → Configurar bot ativo                     │
│     └ Monitoramento  → Expiração, renovação                     │
│                                                                 │
│  🔗 API (Next.js Route Handlers)                                │
│     ├ /api/store/plans         → Planos disponíveis             │
│     ├ /api/store/subscription  → Criar/ver/gerenciar assinatura │
│     ├ /api/store/guilds        → Guilds do usuário              │
│     ├ /api/store/activate      → Ativar bot em guild            │
│     ├ /api/webhooks/mercadopago → Webhook pagamento             │
│     └ /api/store/admin         → Admin: usuários, bots          │
│                                                                 │
│  🗄️  PostgreSQL (Supabase — schema: store)                      │
│     ├ users, subscriptions, guilds, guild_bots, plans, invoices │
│     └ Webhook logs, activation history                          │
│                                                                 │
│  💳 Mercado Pago                                                │
│     ├ Planos recorrentes (preapproval)                          │
│     ├ Webhook IPN para status                                   │
│     └ Renovação automática                                      │
└────────────────────────────────────────────────────────────────┘
```

---

## Banco de Dados (Schema `store`)

```sql
-- Planos disponíveis
CREATE TABLE store.plans (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,           -- "Free", "Premium", "Enterprise"
  slug VARCHAR(50) UNIQUE NOT NULL,      -- "free", "premium", "enterprise"
  price_cents INTEGER NOT NULL DEFAULT 0, -- Preço em centavos
  max_guilds INTEGER NOT NULL DEFAULT 1,
  features JSONB DEFAULT '[]',           -- ["shield", "aegis", "ticket"]
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Usuários (link com ArxAuthPortal via openId)
CREATE TABLE store.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  open_id VARCHAR(128) UNIQUE NOT NULL,  -- ID do ArxAuthPortal
  discord_id VARCHAR(32),
  email VARCHAR(256),
  name VARCHAR(256),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Assinaturas
CREATE TABLE store.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES store.users(id),
  plan_id INTEGER REFERENCES store.plans(id),
  mp_preapproval_id VARCHAR(128),         -- ID da assinatura no MercadoPago
  status VARCHAR(30) DEFAULT 'pending',   -- pending, active, paused, cancelled, expired
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Servidores (guilds)
CREATE TABLE store.guilds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guild_id VARCHAR(32) UNIQUE NOT NULL,   -- Discord guild ID
  owner_discord_id VARCHAR(32),
  name VARCHAR(256),
  icon VARCHAR(256),
  member_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Bots ativados por guild (quais bots cada servidor tem)
CREATE TABLE store.guild_bots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guild_id UUID REFERENCES store.guilds(id),
  subscription_id UUID REFERENCES store.subscriptions(id),
  bot_slug VARCHAR(50) NOT NULL,          -- "shield", "aegis", "ticket"
  status VARCHAR(30) DEFAULT 'active',    -- active, paused, disabled
  activated_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ,
  UNIQUE(guild_id, bot_slug)
);

-- Faturas/pagamentos
CREATE TABLE store.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID REFERENCES store.subscriptions(id),
  mp_payment_id VARCHAR(128),
  amount_cents INTEGER,
  status VARCHAR(30),                     -- approved, pending, rejected
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Webhook logs (debug/auditoria)
CREATE TABLE store.webhook_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source VARCHAR(50),                     -- "mercadopago"
  event_type VARCHAR(100),
  payload JSONB,
  processed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Configurações globais da Store
CREATE TABLE store.settings (
  key VARCHAR(100) PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE store.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE store.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE store.guilds ENABLE ROW LEVEL SECURITY;
ALTER TABLE store.guild_bots ENABLE ROW LEVEL SECURITY;
ALTER TABLE store.invoices ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "users_read_own" ON store.users FOR SELECT USING (discord_id = current_setting('request.jwt.claims')::json->>'sub');
CREATE POLICY "subscriptions_read_own" ON store.subscriptions FOR SELECT USING (user_id IN (SELECT id FROM store.users WHERE discord_id = current_setting('request.jwt.claims')::json->>'sub'));
```

---

## Dashboard Web (Next.js 14)

### Estrutura de Diretórios
```
ARX Store/
├── package.json
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── middleware.ts
├── .env.local
├── docker-compose.yml
├── Dockerfile
│
├── src/
│   ├── app/
│   │   ├── layout.tsx              ← Root layout (Providers, Navbar)
│   │   ├── globals.css
│   │   ├── page.tsx                ← Landing page
│   │   │
│   │   ├── login/
│   │   │   └── page.tsx            ← Login (Discord + ARX Auth)
│   │   │
│   │   ├── (dashboard)/            ← Route group (layout compartilhado)
│   │   │   ├── layout.tsx          ← Dashboard sidebar + header
│   │   │   ├── page.tsx            ← /dashboard — visão geral
│   │   │   ├── servidores/
│   │   │   │   └── page.tsx        ← Meus servidores
│   │   │   ├── servidores/[id]/
│   │   │   │   └── page.tsx        ← Config de bot por servidor
│   │   │   ├── planos/
│   │   │   │   └── page.tsx        ← Upgrade/downgrade
│   │   │   ├── faturamento/
│   │   │   │   └── page.tsx        ← Histórico
│   │   │   └── perfil/
│   │   │       └── page.tsx        ← Meus dados
│   │   │
│   │   ├── admin/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx            ← Admin dashboard
│   │   │   ├── usuarios/
│   │   │   │   └── page.tsx        ← Gerenciar usuários
│   │   │   ├── planos/
│   │   │   │   └── page.tsx        ← Gerenciar planos
│   │   │   └── assinaturas/
│   │   │       └── page.tsx        ← Visão geral assinaturas
│   │   │
│   │   └── api/
│   │       ├── auth/
│   │       │   ├── [...nextauth]/route.ts
│   │       │   ├── arx-callback/route.ts
│   │       │   └── me/route.ts
│   │       │
│   │       ├── store/
│   │       │   ├── plans/route.ts
│   │       │   ├── subscription/route.ts
│   │       │   ├── guilds/route.ts
│   │       │   ├── guilds/[id]/route.ts
│   │       │   ├── activate/route.ts
│   │       │   └── invoices/route.ts
│   │       │
│   │       └── webhooks/
│   │           └── mercadopago/route.ts
│   │
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts           ← Browser client
│   │   │   ├── server.ts           ← Server + Admin client
│   │   │   └── middleware.ts       ← Supabase middleware
│   │   ├── auth.ts                 ← Auth helpers
│   │   ├── session.ts              ← getAuthSession()
│   │   ├── mercadopago.ts           ← MP client wrapper
│   │   └── store.ts                ← Store DB queries
│   │
│   ├── components/
│   │   ├── ui/                     ← shadcn/ui components
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   ├── Sidebar.tsx             ← Dashboard sidebar
│   │   ├── PlanCard.tsx             ← Card de plano
│   │   ├── BotCard.tsx              ← Card de bot ativado
│   │   ├── GuildSelector.tsx        ← Seletor de servidor
│   │   ├── SubscriptionStatus.tsx
│   │   └── providers/
│   │       ├── SessionProvider.tsx
│   │       └── StoreProvider.tsx
│   │
│   └── hooks/
│       ├── useStore.ts
│       └── useGuilds.ts
│
│   bot/                            ← Bot Manager
│   ├── package.json
│   ├── tsconfig.json
│   ├── src/
│   │   ├── index.ts                ← Entry point
│   │   ├── config.ts               ← Config (env vars)
│   │   ├── deploy-commands.ts
│   │   └── base/
│   │       └── index.ts             ← Framework (@magicyan/discord)
│   │   ├── commands/
│   │   │   ├── loja.ts             ← /loja
│   │   │   ├── meuplano.ts         ← /meuplano
│   │   │   ├── ativar.ts           ← /ativar
│   │   │   └── admin.ts            ← /admin commands
│   │   └── responders/
│   │       └── activation.ts       ← Botão ativar/desativar
│   └── Dockerfile
```

### Fluxo de Autenticação
1. Usuário entra em `arxstore.arxdevs.xyz/login`
2. Escolhe: "Entrar com Discord" ou "Entrar com ARX"
3. **Discord**: NextAuth com OAuth2 → permissão `guilds` + `identify` → sessão
4. **ARX**: Redireciona para `auth.arxdevs.xyz` → login → callback com `code` → troca por JWT → cookie `arx_token`
5. Middleware protege `/dashboard/*` e `/admin/*`
6. Toda API verifica sessão via `getAuthSession()`

### Fluxo de Assinatura
1. Usuário vê planos em `/planos`
2. Clica "Assinar" no Premium → POST `/api/store/subscription`
3. Backend cria `preapproval` no MercadoPago (assinatura recorrente)
4. Retorna URL de checkout → redireciona usuário
5. Usuário aprova no MercadoPago
6. Webhook recebe `subscription_authorized` → ativa assinatura
7. Usuário volta ao dashboard → vê plano ativo
8. Pode ir em `/servidores` → adicionar bots aos seus servidores

### Fluxo de Ativação de Bot
1. Usuário no dashboard, em `/servidores`
2. Seleciona um servidor (via Discord OAuth guild list)
3. Escolhe qual bot ativar (Shield, Aegis, etc.)
4. POST `/api/store/activate` → cria `guild_bots` row
5. Se o bot já está no servidor, ativa as features
6. Se não está, mostra link de convite OAuth2 para adicionar

---

## Bot Manager (discord.js)

### Comandos
| Comando | Descrição | Onde funciona |
|---|---|---|
| `/loja` | Lista bots disponíveis e planos | DM + servidores |
| `/meuplano` | Mostra assinatura atual, data de expiração | DM + servidores |
| `/ativar <bot>` | Ativa um bot no servidor atual | Servidores (admin) |
| `/desativar <bot>` | Desativa bot do servidor | Servidores (admin) |
| `/status` | Status dos bots no servidor | Servidores |
| `/admin planos` | Gerenciar planos | Staff only |
| `/admin usuarios` | Ver/buscar usuários | Staff only |

### Eventos
| Evento | Ação |
|---|---|
| `GuildCreate` | Registra guild no banco, verifica se tem assinatura ativa |
| `GuildDelete` | Marca guild_bots como `disabled` |
| Cron (diário) | Verifica assinaturas expirando, notifica 7d e 1d antes |
| Cron (diário) | Desativa bots de assinaturas expiradas |

---

## Serviço de Bots Personalizados (Sob Medida)

Cliente solicita um bot exclusivo, sem branding ARX. ARX desenvolve, entrega o código e opcionalmente hospeda.

### Fluxo
```
1. Cliente preenche formulário de briefing
   ↓
2. ARX analisa e envia orçamento (via dashboard)
   ↓
3. Cliente aprova + paga (50% adiantado via MP)
   ↓
4. ARX desenvolve o bot
   ↓
5. Entrega do código (GitHub privado ou ZIP)
   ↓
6. Opcional: ARX hospeda (plano mensal de hosting)
   ↓
7. Cliente pode editar o bot via dashboard (se hospedado)
```

### Tabelas adicionais
```sql
-- Pedidos de bot personalizado
CREATE TABLE store.custom_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES store.users(id),
  status VARCHAR(30) DEFAULT 'briefing',
  name VARCHAR(256),
  description TEXT,
  requirements TEXT,
  price_cents INTEGER,
  hosting_monthly_cents INTEGER,
  source_repo_url VARCHAR(512),
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Chat cliente↔ARX sobre o pedido
CREATE TABLE store.custom_order_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES store.custom_orders(id),
  author_type VARCHAR(20),
  author_id UUID,
  content TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Bot personalizado hospedado
CREATE TABLE store.custom_bots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES store.custom_orders(id),
  user_id UUID REFERENCES store.users(id),
  guild_id VARCHAR(32),
  bot_token_encrypted TEXT,
  bot_client_id VARCHAR(32),
  status VARCHAR(30) DEFAULT 'active',
  config JSONB DEFAULT '{}',
  last_restart_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### Preços de referência
| Complexidade | Preço | Hosting/mês |
|---|---|---|
| Simples (comandos básicos) | R$ 49,90 | R$ 9,90 |
| Médio (sistema customizado) | R$ 149,90 | R$ 19,90 |
| Avançado (dashboard + bot + DB) | R$ 499,90 | R$ 39,90 |
| Enterprise | Sob consulta | Sob consulta |

---

## Editor de Bots (Dashboard)

Cada bot ativado tem um painel de configuração editável pelo cliente direto na dashboard, sem mexer em código.

### O que pode ser editado por bot
| Bot | Configurações |
|---|---|
| **Shield Security** | Canais de log, severidade auto-ban, mensagens, whitelist |
| **Aegis** | Blacklist/whitelist, prefixo, canais, cargos staff |
| **ARX Ticket** | Categoria, cargo staff, mensagens, horário comercial |
| **ARX Invite** | Recompensas, canais, mensagens DM |
| **ARX Mod** | Filtros, anti-spam, cargos mute/ban |
| **Personalizado** | Config JSON livre (definido no briefing) |

### Como funciona
1. Cliente em `/servidores/[id]` → vê bots ativos
2. Clica "Configurar" → abre painel com seções (Geral, Features, Canais, Cargos, Mensagens)
3. Edita e salva → API atualiza `guild_bots.config` JSONB
4. Bot lê do banco em tempo real (polling ou evento)

### Novas páginas da dashboard
| Rota | Descrição |
|---|---|
| `/personalizado` | Landing do serviço sob medida |
| `/personalizado/pedir` | Formulário de briefing |
| `/personalizado/meus-pedidos` | Pedidos do cliente |
| `/personalizado/[id]` | Detalhes + chat com ARX |
| `/servidores/[id]/[bot]` | Editor de configuração do bot |

### Bot Manager — novos comandos
| Comando | Descrição |
|---|---|
| `/editar <bot>` | Abre painel de edição (atalho Discord) |
| `/config <bot>` | Ver configuração atual |

---

## Fases de Implementação

### Fase 1 — Fundação (hoje)
- [ ] Criar projeto Next.js 14 (`npx create-next-app`)
- [ ] Instalar dependências (supabase, next-auth, discord.js, mercadopago, @magicyan/discord, tailwind, shadcn)
- [ ] Criar schema `store` no banco (rodar SQL)
- [ ] Configurar Supabase client (seguir padrão Shield)
- [ ] Configurar NextAuth + ARX Auth (dual auth)
- [ ] Middleware de proteção de rotas
- [ ] Layout base com Navbar, Footer, Providers

### Fase 2 — Dashboard
- [ ] Landing page
- [ ] Página de planos (`/planos`)
- [ ] Dashboard (`/dashboard`) com visão geral
- [ ] Página de servidores (`/servidores`)
- [ ] Página de perfil (`/perfil`)

### Fase 3 — Pagamentos
- [ ] Integração MercadoPago (SDK)
- [ ] Criar planos no MP (preapproval plans)
- [ ] API `/api/store/subscription` (criar/consultar)
- [ ] Webhook `/api/webhooks/mercadopago`
- [ ] Faturamento (`/faturamento`)

### Fase 4 — Bot Manager
- [ ] Estrutura do bot (base/, commands/, responders/)
- [ ] Comandos: /loja, /meuplano, /ativar, /desativar
- [ ] Eventos: GuildCreate, GuildDelete
- [ ] Cron de verificação de expiração
- [ ] API `/api/store/activate`

### Fase 5 — Bots adicionais + Editor
- [ ] ARX Ticket (refazer LEGACY no padrão @magicyan/discord)
- [ ] ARX Invite
- [ ] ARX Mod
- [ ] Editor de bots no dashboard (`/servidores/[id]/[bot]`)
- [ ] Sistema de `guild_bots.config` JSONB + leitura em tempo real
- [ ] Comandos `/editar` e `/config` no Bot Manager

### Fase 6 — Bots Personalizados
- [ ] Landing page `/personalizado`
- [ ] Formulário de briefing `/personalizado/pedir`
- [ ] Sistema de pedidos (CRUD + chat ARX↔cliente)
- [ ] Orçamento e pagamento (50% adiantado)
- [ ] Área do cliente: `/personalizado/meus-pedidos`
- [ ] Admin: gerenciar pedidos, enviar orçamento
- [ ] Hospedagem de bots personalizados (Docker por cliente)

### Fase 7 — Admin Geral
- [ ] Painel admin web
- [ ] Gerenciamento de usuários, planos, assinaturas
- [ ] Gerenciamento de pedidos personalizados
- [ ] Métricas e analytics
- [ ] Logs de webhook

---

## Convenções (seguir padrão Shield)

- TypeScript em tudo
- Supabase: `createClient()` factory, não singleton
- Auth: dual (ARX JWT + NextAuth Discord)
- API routes: Next.js Route Handlers, Supabase admin client pra bypass RLS
- Componentes: `'use client'` no topo, Server Components pra fetch inicial
- Tailwind + shadcn/ui + `cn()` utility
- Bot: `@magicyan/discord` + `base/index.ts` custom framework
- CustomId routing: `feature/action/:param`
