import Link from "next/link"
import Image from "next/image"
import { Shield, Headphones, Wallet, Zap, Server, Check, ArrowRight, LayoutGrid, Ticket, ShoppingCart } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/server"
import { BOT_PRODUCTS, PRICING_TIERS, formatPriceCents } from "@/lib/pricing"

export const dynamic = 'force-dynamic'

const features = [
  { icon: Shield, title: "Bots Prontos", description: "Shield Security, Aegis, Ticket, Invite e Mod. Plug-and-play e alto padrao." },
  { icon: LayoutGrid, title: "Painel Intuitivo", description: "Gerencie tudo pelo dashboard. Zero comandos complicados e interface limpa." },
  { icon: Zap, title: "Deploy Rapido", description: "Adicione bots ao seu servidor quase imediatamente apos a selecao." },
  { icon: Wallet, title: "Precos Justos", description: "Compra unica, sem assinatura. Pague uma vez e use quando quiser." },
  { icon: Server, title: "Host Confiavel", description: "Infraestrutura flexivel e redundante para evitar quedas criticas." },
  { icon: Headphones, title: "Suporte Tecnico", description: "Nossa equipe orienta, gerencia e ajusta via ticket para seu servidor." },
]

export default async function LandingPage() {
  const supabase = createClient()

  let activeBots = 0
  let activeGuilds = 0

  try {
    const { count: botCount } = await supabase
      .schema("store")
      .from("guild_bots")
      .select("*", { count: "exact", head: true })
      .eq("status", "active")
    activeBots = botCount ?? 0

    const { count: guildCount } = await supabase
      .schema("store")
      .from("guilds")
      .select("*", { count: "exact", head: true })
    activeGuilds = guildCount ?? 0
  } catch {
    // ignore
  }

  const stats = [
    { value: `${activeBots}+`, label: "Bots Ativos" },
    { value: "99.9%", label: "Uptime (SLA)" },
    { value: `${activeGuilds}+`, label: "Servidores Seguros" },
    { value: "24/7", label: "Monitoramento" },
  ]

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30 overflow-x-hidden font-sans">

      {/* ================================================================ */}
      {/* HERO: Cinematic Precision */}
      {/* ================================================================ */}
      <section className="relative pt-24 md:pt-36 pb-24 md:pb-32 border-b border-outline-variant overflow-hidden">
        {/* Deep Space Background Layer */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-surface dot-grid opacity-[0.4]" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full bg-[radial-gradient(ellipse_at_50%_0%,rgba(225,29,72,0.12),transparent_70%)]" />
          <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[140px]" />
        </div>

        <div className="container mx-auto px-6 max-w-6xl relative z-10">
          <div className="text-center space-y-10">
            <div className="space-y-6 animate-reveal">
              <div className="flex justify-center mb-10">
                <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl bg-surface-container border border-outline-variant flex items-center justify-center shadow-2xl relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-b from-primary/20 to-transparent opacity-50" />
                  <Image
                    src="/arx-logo.png"
                    alt="ARX Logo"
                    width={64}
                    height={64}
                    className="object-contain relative z-10"
                  />
                </div>
              </div>
              <div className="flex justify-center mb-6">
                <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-surface-container-high border border-outline-variant/60 text-[11px] font-medium uppercase tracking-[0.15em] text-on-surface-variant shadow-sm backdrop-blur-md">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                  </span>
                  Plataforma de Bots Enterprise
                </div>
              </div>
            </div>

            <div className="space-y-6 animate-reveal" style={{ animationDelay: '0.1s' }}>
              <h1 className="text-5xl md:text-7xl lg:text-[80px] font-heading font-[520] tracking-[-0.05em] leading-[1.05] text-on-surface">
                Arquitetura Superior para<br className="hidden md:block" />
                <span className="text-primary" style={{ textShadow: "0 0 40px rgba(225,29,72,0.3)" }}> Seu Servidor.</span>
              </h1>
              <p className="text-lg md:text-xl text-on-surface-variant font-medium max-w-2xl mx-auto leading-relaxed tracking-tight">
                Infraestrutura completa de bots para o Discord. Resolva moderacao, tickets e protecao com uma implementacao instantanea no painel web.
              </p>
            </div>

            <div className="pt-6 animate-reveal" style={{ animationDelay: '0.2s' }}>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 h-14 text-[15px] font-medium tracking-tight rounded-md shadow-[0_0_80px_rgba(225,29,72,0.2)] transition-all">
                  <Link href="/dashboard">
                    Comecar Agora
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="bg-surface-container border-outline-variant hover:bg-surface-container-high text-on-surface px-8 h-14 text-[15px] font-medium tracking-tight rounded-md transition-all">
                  <Link href="/produtos">Ver Produtos</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* STATS BAR */}
      {/* ================================================================ */}
      <section className="py-12 border-b border-outline-variant bg-surface-container-lowest">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-outline-variant/30">
            {stats.map((stat, i) => (
              <div key={i} className="text-center px-4">
                <div className="text-3xl md:text-4xl font-heading font-[520] tracking-tight text-on-surface">{stat.value}</div>
                <div className="text-[11px] font-medium text-on-surface-variant mt-2 tracking-[0.1em] uppercase">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* FEATURES */}
      {/* ================================================================ */}
      <main className="container mx-auto px-6 max-w-6xl py-32 space-y-32">
        <section className="space-y-16">
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <h2 className="text-[12px] font-bold uppercase tracking-[0.2em] text-primary">Tecnologia</h2>
            <h3 className="text-3xl md:text-5xl font-heading font-[520] tracking-[-0.04em] text-on-surface">Tudo Para Operar em Alta Performance</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => {
              const Icon = feature.icon
              return (
                <Card
                  key={feature.title}
                  className={cn(
                    "bg-surface-container border-outline-variant hover:border-primary/40 hover:bg-surface-container-high transition-colors duration-300 rounded-lg group shadow-sm",
                    "animate-in",
                  )}
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  <CardHeader>
                    <div className="w-10 h-10 rounded mb-4 flex items-center justify-center bg-surface-container-highest border border-outline-variant/50 group-hover:bg-primary/10 group-hover:border-primary/20 transition-colors">
                      <Icon className="h-5 w-5 text-on-surface-variant group-hover:text-primary transition-colors" />
                    </div>
                    <CardTitle className="text-lg font-heading tracking-tight text-on-surface font-medium">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-on-surface-variant text-[14px] leading-relaxed tracking-tight">{feature.description}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </section>
      </main>

      {/* ================================================================ */}
      {/* PRODUCTS */}
      {/* ================================================================ */}
      <section className="py-32 border-t border-outline-variant bg-surface-container-lowest">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center mb-20 space-y-4 max-w-2xl mx-auto">
            <h2 className="text-[12px] font-bold uppercase tracking-[0.2em] text-primary">Nossos Bots</h2>
            <p className="text-3xl md:text-5xl font-heading font-[520] tracking-[-0.04em] text-on-surface">Compra Unica, Ativa Quando Quiser</p>
            <p className="text-on-surface-variant text-[15px] tracking-tight">Sem assinatura mensal. Pague uma vez, use quando precisar. Suporte via Discord.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {BOT_PRODUCTS.map((product, i: number) => {
              const Icon = product.icon === 'ticket' ? Ticket : ShoppingCart
              const isHighlighted = product.slug === 'promisse-tickets'

              return (
                <Card
                  key={product.slug}
                  className={cn(
                    "relative flex flex-col bg-surface-container border-outline-variant rounded-xl transition-all duration-300",
                    isHighlighted ? "border-primary/50 shadow-[0_0_80px_rgba(225,29,72,0.08)] md:scale-[1.02] bg-surface-container-high z-10 py-4" : "hover:border-outline-variant/80 hover:bg-surface-container-high",
                    "animate-in"
                  )}
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  {isHighlighted && (
                    <div className="absolute -top-4 left-0 right-0 mx-auto w-fit">
                      <div className="bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-[0.1em] px-3 py-1 rounded">
                        O Mais Popular
                      </div>
                    </div>
                  )}
                  <CardHeader className="text-center pb-6 border-b border-outline-variant/50">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl font-heading font-medium tracking-tight text-on-surface">{product.name}</CardTitle>
                    <div className="mt-4 flex flex-wrap justify-center gap-2">
                      {PRICING_TIERS.map((tier) => (
                        <div key={tier.months} className="text-center">
                          <div className="text-sm font-bold text-on-surface">{formatPriceCents(tier.priceCents)}</div>
                          <div className="text-[10px] text-on-surface-variant uppercase">{tier.label}</div>
                        </div>
                      ))}
                    </div>
                    <CardDescription className="mt-4 text-[13px] tracking-tight">{product.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 pt-8 px-8">
                    <ul className="space-y-4">
                      {product.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-3">
                          <Check className={cn(
                            "h-[18px] w-[18px] mt-[1px] shrink-0",
                            isHighlighted ? "text-primary" : "text-on-surface-variant"
                          )} />
                          <span className="text-[14px] text-on-surface tracking-tight leading-tight">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    {product.allowTicketAddon && (
                      <div className="mt-4 text-xs text-on-surface-variant bg-surface-container-highest rounded p-2 text-center">
                        Addon Sistema de Ticket disponível (+{formatPriceCents(790)})
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="pt-8 px-8 pb-8">
                    <Button
                      asChild
                      className={cn(
                        "w-full h-12 rounded transition-all",
                        isHighlighted
                          ? "bg-primary hover:bg-primary/90 text-primary-foreground shadow-md"
                          : "bg-surface-container-highest hover:bg-surface-container border border-outline-variant text-on-surface"
                      )}
                    >
                      <Link href={`/produtos/${product.slug}`}>
                        Comprar {product.name}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* BOTTOM CTA */}
      {/* ================================================================ */}
      <section className="relative py-32 border-t border-outline-variant overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-primary/5 via-transparent to-transparent pointer-events-none" />
        <div className="container mx-auto px-6 max-w-3xl text-center relative z-10">
          <div className="bg-surface-container/40 backdrop-blur-xl border border-outline-variant/60 rounded-2xl p-12 md:p-16">
            <div className="space-y-4 mb-10">
              <h2 className="text-3xl md:text-5xl font-heading font-[520] tracking-[-0.04em] text-on-surface">
                Construa Seu Imperio<span className="text-primary">.</span>
              </h2>
              <p className="text-on-surface-variant text-[16px] tracking-tight max-w-xl mx-auto leading-relaxed">
                Pare de perder tempo com bots quebrados e scripts antigos. Otimize sua gestao hoje mesmo de forma centralizada e escalavel.
              </p>
            </div>
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-10 h-14 text-[15px] font-medium tracking-tight rounded shadow-[0_0_60px_rgba(225,29,72,0.15)] transition-all">
              <Link href="/dashboard">
                Acessar Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
