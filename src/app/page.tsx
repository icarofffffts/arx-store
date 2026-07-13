import Link from "next/link"
import { Shield, Bot, Headphones, Wallet, Zap, Server, Check, ArrowRight, ShoppingBag, Star } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const features = [
  { icon: Shield, title: "Bots Prontos", description: "Shield Security, Aegis, Ticket, Invite e Mod. Plug-and-play." },
  { icon: Bot, title: "Painel Web", description: "Gerencie tudo pelo dashboard. Zero comandos complicados." },
  { icon: Zap, title: "1 Clique", description: "Adicione bots ao seu servidor com apenas um clique." },
  { icon: Wallet, title: "Precos Justos", description: "Planos do gratuito ao enterprise que cabem no seu bolso." },
  { icon: Server, title: "Host Confiavel", description: "Infraestrutura propria com 99.9% de uptime garantido." },
  { icon: Headphones, title: "Suporte 24h", description: "Equipe sempre disponivel via ticket para te ajudar." },
]

const stats = [
  { value: "5+", label: "Bots Profissionais" },
  { value: "99.9%", label: "Uptime" },
  { value: "Suporte 24h", label: "Via Ticket" },
  { value: "R$ 0", label: "Plano Gratis" },
]

const plans = [
  {
    name: "Free",
    price: "R$ 0",
    period: "/mes",
    description: "Ideal para comecar",
    features: ["1 bot ativo (Shield ou Aegis)", "1 servidor", "Comandos basicos", "Suporte da comunidade"],
    cta: "Comecar Gratis",
    href: "/dashboard",
    highlighted: false,
  },
  {
    name: "Premium",
    price: "R$ 29,90",
    period: "/mes",
    description: "O mais popular",
    features: ["Todos os bots disponiveis", "Ate 3 servidores", "Painel web completo", "Suporte via ticket 24h", "Editor de configuracao"],
    cta: "Assinar Premium",
    href: "/dashboard/planos",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "R$ 79,90",
    period: "/mes",
    description: "Para servidores grandes",
    features: ["Tudo do Premium", "Servidores ilimitados", "White-label", "Suporte prioritario", "Bot personalizado"],
    cta: "Falar com Vendas",
    href: "/dashboard/planos",
    highlighted: false,
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-red-500/30 overflow-x-hidden">

      {/* ================================================================ */}
      {/* HERO */}
      {/* ================================================================ */}
      <section className="relative pt-32 md:pt-48 pb-24 md:pb-40 border-b border-white/[0.05]">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full bg-[radial-gradient(circle_at_50%_0%,rgba(225,29,72,0.1),transparent_50%)]" />
          <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-red-500/5 rounded-full blur-[120px]" />
          <div className="absolute top-[20%] -right-[10%] w-[30%] h-[30%] bg-blue-500/5 rounded-full blur-[120px]" style={{ animationDelay: '1s' }} />
        </div>

        <div className="container mx-auto px-6 max-w-6xl relative z-10">
          <div className="text-center space-y-12">
            <div className="space-y-8 animate-reveal">
              <div className="flex justify-center">
                <div className="w-20 h-20 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                  <ShoppingBag className="h-10 w-10 text-red-500" />
                </div>
              </div>
              <div className="flex justify-center">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                  Plataforma de Bots Profissionais
                </div>
              </div>
            </div>

            <div className="space-y-6 animate-reveal" style={{ animationDelay: '0.1s' }}>
              <h1 className="text-5xl md:text-8xl font-black tracking-tighter leading-[0.85] lg:px-12 text-glow">
                Bots Discord Profissionais<span className="text-red-600">.</span>
              </h1>
              <p className="text-lg md:text-xl text-slate-400 font-medium max-w-2xl mx-auto leading-relaxed">
                Plataforma completa de bots para Discord. Protecao, moderacao, tickets e muito mais.
                Ative em 1 clique e gerencie tudo pelo painel web.
              </p>
            </div>

            <div className="pt-4 animate-reveal" style={{ animationDelay: '0.2s' }}>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button asChild size="lg" className="bg-red-600 hover:bg-red-700 text-white px-10 h-14 text-base shadow-[0_0_100px_rgba(225,29,72,0.1)]">
                  <Link href="/dashboard">
                    Comecar Gratis
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="px-10 h-14 text-base border-white/10 hover:bg-white/5 text-slate-300">
                  <Link href="/dashboard/planos">Ver Planos</Link>
                </Button>
              </div>
              <div className="mt-10 flex justify-center items-center gap-8 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
                {["Protecao Anti-Scam", "Tickets", "Convites", "Moderacao", "99.9% Uptime"].map((f) => (
                  <span key={f} className="hover:text-red-500 transition-colors">{f}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* STATS BAR */}
      {/* ================================================================ */}
      <section className="py-12 border-b border-white/[0.05] bg-white/[0.01]">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label + stat.value} className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-red-500">{stat.value}</div>
                {stat.label && <div className="text-xs text-slate-500 mt-2 font-bold uppercase tracking-[0.2em]">{stat.label}</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* FEATURES */}
      {/* ================================================================ */}
      <main className="container mx-auto px-6 max-w-6xl py-24 space-y-40">
        <section className="space-y-12">
          <div className="flex items-end justify-between border-b border-white/[0.05] pb-8">
            <div className="space-y-2">
              <h2 className="text-xs font-bold uppercase tracking-[0.4em] text-red-500">Recursos</h2>
              <p className="text-3xl md:text-4xl font-black text-white tracking-tight">Tudo que voce precisa</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => {
              const Icon = feature.icon
              return (
                <Card
                  key={feature.title}
                  className={cn(
                    "bg-white/[0.02] border-white/[0.05] hover:border-red-500/20 transition-all duration-300 group",
                    "animate-in",
                  )}
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  <CardHeader>
                    <div className="w-12 h-12 rounded-lg bg-red-500/10 border border-red-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Icon className="h-6 w-6 text-red-500" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-400 text-sm leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </section>
      </main>

      {/* ================================================================ */}
      {/* PRICING */}
      {/* ================================================================ */}
      <section className="py-24 border-t border-white/[0.05] bg-white/[0.01]">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-[0.4em] text-red-500">Planos</h2>
            <p className="text-3xl md:text-4xl font-black text-white tracking-tight">Planos para todos os tamanhos</p>
            <p className="text-slate-400 max-w-xl mx-auto">Escolha o plano ideal. Sem taxa de setup. Cancele quando quiser.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.map((plan, i) => (
              <Card
                key={plan.name}
                className={cn(
                  "relative flex flex-col border-white/[0.06] bg-white/[0.02]",
                  "animate-in",
                  plan.highlighted && "border-red-500/30 shadow-[0_0_60px_rgba(225,29,72,0.1)] scale-[1.03]"
                )}
                style={{ animationDelay: `${i * 100}ms` }}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-0 right-0 mx-auto w-fit">
                    <Badge className="bg-red-600 hover:bg-red-600 border-0 shadow-lg shadow-red-500/20">
                      Mais Popular
                    </Badge>
                  </div>
                )}
                <CardHeader className="text-center pb-2">
                  <CardTitle className="text-xl font-semibold">{plan.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-5xl font-bold tracking-tight">{plan.price}</span>
                    <span className="text-muted-foreground ml-1 text-sm">{plan.period}</span>
                  </div>
                  <CardDescription className="mt-2 text-sm">{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 pt-4">
                  <ul className="space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3 text-sm">
                        <Check className={cn(
                          "h-4 w-4 mt-0.5 shrink-0",
                          plan.highlighted ? "text-red-500" : "text-slate-500"
                        )} />
                        <span className="text-slate-400">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    asChild
                    variant={plan.highlighted ? "default" : "outline"}
                    className={cn(
                      "w-full h-11",
                      plan.highlighted
                        ? "bg-red-600 hover:bg-red-700 shadow-[0_0_30px_rgba(225,29,72,0.2)]"
                        : "border-white/10 hover:bg-white/5 text-slate-300"
                    )}
                  >
                    <Link href={plan.href}>{plan.cta}</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* CTA */}
      {/* ================================================================ */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-red-500/5 via-transparent to-transparent" />
        <div className="container mx-auto px-6 max-w-3xl text-center relative z-10">
          <div className="glass p-10 md:p-14 border-red-500/10">
            <div className="space-y-2 mb-8">
              <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight">
                Pronto para transformar seu servidor<span className="text-red-600">.</span>
              </h2>
              <p className="text-slate-400 max-w-xl mx-auto">
                Junte-se a centenas de servidores que ja confiam no ARX Store. Comece gratuitamente hoje.
              </p>
            </div>
            <Button asChild size="lg" className="bg-red-600 hover:bg-red-700 text-white px-10 h-14 text-base shadow-[0_0_100px_rgba(225,29,72,0.15)]">
              <Link href="/dashboard">
                Criar Conta Gratis
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* FOOTER */}
      {/* ================================================================ */}
      <footer className="border-t border-white/[0.05] py-10">
        <div className="container mx-auto px-6 max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-4 w-4 text-red-500" />
            <span>&copy; {new Date().getFullYear()} ARX Store. Todos os direitos reservados.</span>
          </div>
          <div className="flex items-center gap-8">
            <Link href="/dashboard/planos" className="hover:text-white transition-colors">Planos</Link>
            <Link href="/termos" className="hover:text-white transition-colors">Termos</Link>
            <Link href="/privacidade" className="hover:text-white transition-colors">Privacidade</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
