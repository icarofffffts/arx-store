# ARX Store

Plataforma SaaS de bots Discord. Clientes registram, escolhem um plano (Free/Premium/Enterprise), assinam via MercadoPago, adicionam bots aos servidores e gerenciam via dashboard web + bot Manager.

## Estrutura

```
arx-store/
├── web/          → Dashboard Next.js 14 (App Router)
├── plans/        → Documentacao e planos de arquitetura
└── supabase/     → Migrations e schema SQL
```

> O bot Manager está em repositorio separado: [arx-store-bot](https://github.com/icarofffffts/arx-store-bot)

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Dashboard | Next.js 14 + Tailwind CSS + Radix UI |
| Auth | ArxAuthPortal JWT + Discord OAuth2 |
| Database | PostgreSQL (Supabase — schema `store`) |
| Pagamentos | MercadoPago (preapproval recorrente) |
| Bot Manager | discord.js v14 + @magicyan/discord |

## Planos

| Plano | Preco | Bots | Servidores |
|-------|-------|------|-----------|
| Free | R$ 0 | 1 bot | 1 |
| Premium | R$ 29,90 | Todos | 3 |
| Enterprise | R$ 79,90 | Todos + Whitelabel | Ilimitado |

## Bots Disponiveis

- **Shield Security** — Anti-scam, denuncias, consulta de IDs
- **Aegis** — Protecao de servidor, blacklist/whitelist
- **ARX Ticket** — Sistema de tickets/suporte
- **ARX Invite** — Convites com recompensas
- **ARX Mod** — Moderacao automatica
- **Bot Personalizado** — Sob medida (briefing → quote → entrega)

## Deploy

Compativel com Coolify. Cada componente (web, bot) tem seu proprio Dockerfile.

## Documentacao

Ver [plans/arx-store-plan.md](plans/arx-store-plan.md) para arquitetura completa.
