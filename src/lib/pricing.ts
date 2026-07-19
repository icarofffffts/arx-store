// Bot product pricing — shared between website and Discord bot manager
export type BotSlug = 'promisse-tickets' | 'vendas-ghost-studio'
export type DurationMonths = 1 | 3 | 6 | 0 // 0 = lifetime

export interface BotProduct {
  slug: BotSlug
  name: string
  description: string
  icon: string
  features: string[]
  allowTicketAddon: boolean
}

export interface PricingTier {
  months: DurationMonths
  label: string
  priceCents: number
}

export const BOT_PRODUCTS: BotProduct[] = [
  {
    slug: 'promisse-tickets',
    name: 'Promisse Tickets',
    description: 'Sistema completo de tickets com pagamento integrado diretamente no Discord.',
    icon: 'ticket',
    features: [
      'Tickets ilimitados',
      'Pagamento integrado (Pix, cartão, boleto)',
      'Categorias de atendimento',
      'Histórico completo',
      'Notificações automáticas',
    ],
    allowTicketAddon: false,
  },
  {
    slug: 'vendas-ghost-studio',
    name: 'Vendas Ghost Studio',
    description: 'Loja completa no Discord com produtos, carrinho e entregas automáticas.',
    icon: 'shopping',
    features: [
      'Produtos ilimitados',
      'Carrinho de compras',
      'Entrega automática',
      'Gestão de estoque',
      'Relatórios de vendas',
    ],
    allowTicketAddon: true,
  },
]

export const PRICING_TIERS: PricingTier[] = [
  { months: 1, label: '1 mês', priceCents: 790 },      // R$ 7,90
  { months: 3, label: '3 meses', priceCents: 1990 },   // R$ 19,90
  { months: 6, label: '6 meses', priceCents: 3490 },   // R$ 34,90
  { months: 0, label: 'Vitalício', priceCents: 7990 }, // R$ 79,90
]

export const ADDONS = {
  whitelabel: { label: 'Whitelabel (remove marca ARX)', priceCents: 500 },      // +R$ 5,00
  ticketSystem: { label: 'Sistema de Ticket', priceCents: 790 },               // +R$ 7,90
}

export function calculatePrice(
  months: DurationMonths,
  whitelabel: boolean,
  ticketSystem: boolean
): { totalCents: number; breakdown: string[] } {
  const tier = PRICING_TIERS.find((t) => t.months === months)
  if (!tier) throw new Error('Invalid duration')

  const breakdown: string[] = [`${tier.label}: R$ ${(tier.priceCents / 100).toFixed(2).replace('.', ',')}`]
  let totalCents = tier.priceCents

  if (whitelabel) {
    totalCents += ADDONS.whitelabel.priceCents
    breakdown.push(`Whitelabel: +R$ ${(ADDONS.whitelabel.priceCents / 100).toFixed(2).replace('.', ',')}`)
  }

  if (ticketSystem) {
    totalCents += ADDONS.ticketSystem.priceCents
    breakdown.push(`Ticket: +R$ ${(ADDONS.ticketSystem.priceCents / 100).toFixed(2).replace('.', ',')}`)
  }

  return { totalCents, breakdown }
}

export function formatPriceCents(cents: number): string {
  return `R$ ${(cents / 100).toFixed(2).replace('.', ',')}`
}

export function getBotProduct(slug: BotSlug): BotProduct | undefined {
  return BOT_PRODUCTS.find((p) => p.slug === slug)
}
