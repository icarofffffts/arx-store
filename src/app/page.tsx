import Link from "next/link"
import { Shield, Bot, Headphones, Wallet, Zap, Code, Check, ArrowRight, ShoppingBag, Server, Star } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const features = [
  { icon: Shield, title: "Bots Prontos", description: "Shield Security, Aegis, Ticket, Invite e Mod. Plug-and-play." },
  { icon: Bot, title: "Painel Web", description: "Gerencie tudo pelo dashboard. Zero comandos complicados." },
  { icon: Zap, title: "1 Clique", description: "Adicione bots ao seu servidor com apenas um clique." },
  { icon: Wallet, title: "Preços Justos", description: "Planos do gratuito ao enterprise que cabem no seu bolso." },
  { icon: Server, title: "Host Confiável", description: "Infraestrutura própria com 99.9% de uptime garantido." },
  { icon: Headphones, title: "Suporte 24h", description: "Equipe sempre disponível via ticket para te ajudar." },
]

const stats = [
  { value: "5+", label: "Bots Profissionais" },
  { value: "99.9%", label: "Uptime" },
  { value: "Suporte 24h", label: "Via Ticket" },
  { value: "R$ 0", label: "Plano Grátis" },
]

const plans = [
  {
    name: "Free",
    price: "R$ 0",
    period: "/mês",
    description: "Ideal para começar",
    features: ["1 bot ativo (Shield ou Aegis)", "1 servidor", "Comandos básicos", "Suporte da comunidade"],
    cta: "Começar Grátis",
    href: "/login",
    highlighted: false,
  },
  {
    name: "Premium",
    price: "R$ 29,90",
    period: "/mês",
    description: "O mais popular",
    features: ["Todos os bots disponíveis", "Até 3 servidores", "Painel web completo", "Suporte via ticket 24h", "Editor de configuração"],
    cta: "Assinar Premium",
    href: "/planos",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "R$ 79,90",
    period: "/mês",
    description: "Para servidores grandes",
    features: ["Tudo do Premium", "Servidores ilimitados", "White-label", "Suporte prioritário", "Bot personalizado"],
    cta: "Falar com Vendas",
    href: "/planos",
    highlighted: false,
  },
]

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#030014]">

      {/* ================================================================ */}
      {/* HERO */}
      {/* ================================================================ */}
      <section className="relative flex flex-col items-center justify-center min-h-[90vh] px-4 py-24 text-center overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 dot-grid opacity-40" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-[#7c3aed]/20 rounded-full blur-[120px] opacity-60" />
        <div className="absolute bottom-0 left-1/4 w-[600px] h-[400px] bg-[#5865F2]/15 rounded-full blur-[100px] opacity-50" />
        <div className="absolute top-1/3 right-1/4 w-[400px] h-[300px] bg-[#7c3aed]/10 rounded-full blur-[80px] opacity-40" />

        <div className="relative z-10 max-w-4xl mx-auto">
          {/* Trust badge */}
          <div className="inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-full bg-white/[0.03] border border-white/[0.06] backdrop-blur">
            <div className="flex -space-x-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="w-6 h-6 rounded-full bg-gradient-to-br from-[#5865F2] to-[#7c3aed] border-2 border-[#030014] flex items-center justify-center">
                  <Star className="w-3 h-3 text-white fill-white" />
                </div>
              ))}
            </div>
            <span className="text-sm text-muted-foreground">Confiado por servidores no Discord</span>
          </div>

          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl leading-[1.1]">
            Bots Discord{" "}
            <span className="gradient-text">Profissionais</span>
            <br />
            para seu servidor
          </h1>

          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Plataforma completa de bots para Discord. Proteção, moderação, tickets e muito mais.
            Ative em 1 clique e gerencie tudo pelo painel web.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg" className="w-full sm:w-auto px-10 h-14 text-base bg-[#5865F2] hover:bg-[#4752c4] glow">
              <Link href="/login">
                Começar Grátis
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto px-10 h-14 text-base border-white/[0.08] hover:bg-white/[0.03]">
              <Link href="/planos">Ver Planos</Link>
            </Button>
          </div>

          {/* Feature pills */}
          <div className="mt-14 flex flex-wrap items-center justify-center gap-3">
            {["Proteção Anti-Scam", "Sistema de Tickets", "Convites c/ Recompensa", "Moderação Automática"].map((f) => (
              <span key={f} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-white/[0.03] border border-white/[0.06] text-muted-foreground">
                <Check className="w-3 h-3 text-[#7c3aed]" />
                {f}
              </span>
            ))}
          </div>
        </div>

        {/* Decorative bottom glow */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#5865F2]/30 to-transparent" />
      </section>

      {/* ================================================================ */}
      {/* STATS BAR */}
      {/* ================================================================ */}
      <section className="relative border-y border-white/[0.04] bg-white/[0.01] backdrop-blur">
        <div className="container flex flex-wrap items-center justify-center gap-8 sm:gap-16 py-10">
          {stats.map((stat) => (
            <div key={stat.label + stat.value} className="text-center">
              <div className="text-2xl sm:text-3xl font-bold gradient-text">{stat.value}</div>
              {stat.label && <div className="text-xs text-muted-foreground mt-1.5 tracking-wide uppercase">{stat.label}</div>}
            </div>
          ))}
        </div>
      </section>

      {/* ================================================================ */}
      {/* FEATURES */}
      {/* ================================================================ */}
      <section className="container py-24 lg:py-32">
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4 border-[#7c3aed]/30 text-[#7c3aed] bg-[#7c3aed]/5">
            Recursos
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            Tudo que você{" "}
            <span className="gradient-text">precisa</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Ferramentas profissionais para gerenciar, proteger e engajar sua comunidade.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map((feature, i) => {
            const Icon = feature.icon
            return (
              <Card
                key={feature.title}
                className={cn(
                  "glass-card border-white/[0.05] hover:border-[#5865F2]/20 transition-all duration-300 group",
                  "animate-in",
                )}
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <CardHeader>
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#5865F2]/20 to-[#7c3aed]/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform border border-[#5865F2]/10">
                    <Icon className="h-6 w-6 text-[#5865F2]" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </section>

      {/* ================================================================ */}
      {/* PRICING */}
      {/* ================================================================ */}
      <section className="relative py-24 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#7c3aed]/3 to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#5865F2]/8 rounded-full blur-[150px]" />

        <div className="relative container">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 border-[#5865F2]/30 text-[#5865F2] bg-[#5865F2]/5">
              Planos
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              Planos para todos os{" "}
              <span className="gradient-text">tamanhos</span>
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Escolha o plano ideal. Sem taxa de setup. Cancele quando quiser.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.map((plan, i) => (
              <Card
                key={plan.name}
                className={cn(
                  "relative flex flex-col border-white/[0.06] bg-white/[0.02] backdrop-blur",
                  "animate-in",
                  plan.highlighted && "border-[#5865F2]/40 glow scale-[1.03] bg-[#5865F2]/[0.03]"
                )}
                style={{ animationDelay: `${i * 100}ms` }}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-0 right-0 mx-auto w-fit">
                    <Badge className="bg-gradient-to-r from-[#5865F2] to-[#7c3aed] hover:from-[#5865F2] hover:to-[#7c3aed] border-0 shadow-lg shadow-[#5865F2]/20">
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
                        <Check className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                        <span className="text-muted-foreground">{feature}</span>
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
                        ? "bg-[#5865F2] hover:bg-[#4752c4]"
                        : "border-white/[0.08] hover:bg-white/[0.03]"
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
      <section className="relative py-24 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-[#7c3aed]/10 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-1/4 w-[500px] h-[400px] bg-[#5865F2]/10 rounded-full blur-[120px]" />

        <div className="relative z-10 container max-w-3xl mx-auto text-center">
          <div className="glass-card p-10 md:p-14 border-[#5865F2]/10">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-[#5865F2] to-[#7c3aed] flex items-center justify-center mb-6 shadow-lg shadow-[#5865F2]/20">
              <ShoppingBag className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Pronto para{" "}
              <span className="gradient-text">transformar</span> seu servidor?
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto">
              Junte-se a centenas de servidores que já confiam no ARX Store. Comece gratuitamente hoje.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button asChild size="lg" className="px-10 h-14 text-base bg-[#5865F2] hover:bg-[#4752c4] glow">
                <Link href="/login">
                  Criar Conta Grátis
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* FOOTER */}
      {/* ================================================================ */}
      <footer className="border-t border-white/[0.04] py-10">
        <div className="container flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-4 w-4 text-[#5865F2]" />
            <span>&copy; {new Date().getFullYear()} ARX Store. Todos os direitos reservados.</span>
          </div>
          <div className="flex items-center gap-8">
            <Link href="/planos" className="hover:text-foreground transition-colors">Planos</Link>
            <Link href="#" className="hover:text-foreground transition-colors">Termos</Link>
            <Link href="#" className="hover:text-foreground transition-colors">Privacidade</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
