import Link from "next/link"
import { Shield, Bot, Headphones, Wallet, Zap, Code, Check, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export const dynamic = 'force-dynamic'

const features = [
  {
    icon: Shield,
    title: "Bots prontos",
    description: "Bots pré-configurados para proteção, moderação e gestão de servidores.",
  },
  {
    icon: Bot,
    title: "Gerenciamento via Web",
    description: "Painel completo para configurar seus bots sem comandos complicados.",
  },
  {
    icon: Headphones,
    title: "Suporte 24h via Ticket",
    description: "Equipe de suporte sempre disponível para ajudar quando precisar.",
  },
  {
    icon: Wallet,
    title: "Preços acessíveis",
    description: "Planos que cabem no seu bolso, do gratuito ao enterprise.",
  },
  {
    icon: Zap,
    title: "Ativação em 1 clique",
    description: "Adicione bots ao seu servidor Discord com apenas um clique.",
  },
  {
    icon: Code,
    title: "Sem código necessário",
    description: "Tudo funciona out-of-the-box. Zero conhecimento técnico exigido.",
  },
]

const stats = [
  { value: "5+", label: "Bots" },
  { value: "99.9%", label: "Uptime" },
  { value: "Suporte 24h", label: "" },
]

const plans = [
  {
    name: "Free",
    price: "R$ 0",
    period: "/mês",
    description: "Perfeito para começar",
    features: ["1 bot ativo", "Comandos básicos", "Suporte da comunidade"],
    cta: "Começar Grátis",
    href: "/login",
    highlighted: false,
  },
  {
    name: "Premium",
    price: "R$ 29,90",
    period: "/mês",
    description: "O mais popular",
    features: ["3 bots ativos", "Painel web completo", "Suporte via ticket 24h", "Personalização avançada"],
    cta: "Assinar Premium",
    href: "/planos",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "R$ 99,90",
    period: "/mês",
    description: "Para grandes servidores",
    features: ["Bots ilimitados", "Suporte prioritário", "White-label", "API dedicada", "SLA garantido"],
    cta: "Falar com Vendas",
    href: "/planos",
    highlighted: false,
  },
]

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center px-4 py-32 text-center bg-gradient-to-b from-[#1a0a2e] via-[#0f0b1f] to-background overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#7c3aed]/20 via-transparent to-transparent" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#7c3aed]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#5865F2]/10 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-3xl mx-auto">
          <Badge variant="secondary" className="mb-6 px-4 py-1.5 text-sm">
            Nova plataforma — ARX Store
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            Bots Discord profissionais{" "}
            <span className="bg-gradient-to-r from-[#7c3aed] to-[#5865F2] bg-clip-text text-transparent">
              para seu servidor
            </span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
            Proteção, moderação, tickets e muito mais. Comece grátis.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg" className="w-full sm:w-auto px-8 h-12 text-base">
              <Link href="/login">
                Começar Grátis
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto px-8 h-12 text-base">
              <Link href="/planos">Ver Planos</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="border-y bg-card/50 backdrop-blur">
        <div className="container flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-16 py-8">
          {stats.map((stat) => (
            <div key={stat.label + stat.value} className="text-center">
              <div className="text-2xl font-bold text-[#5865F2]">{stat.value}</div>
              {stat.label && <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>}
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="container py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Tudo que você precisa
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Ferramentas completas para gerenciar, proteger e engajar sua comunidade no Discord.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <Card key={feature.title} className="border-border/50 hover:border-[#5865F2]/30 transition-colors">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-[#5865F2]/10 flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6 text-[#5865F2]" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </section>

      {/* Pricing */}
      <section className="bg-card/30 border-y">
        <div className="container py-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Planos para todos os tamanhos
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Escolha o plano ideal para o seu servidor. Cancele a qualquer momento.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.map((plan) => (
              <Card
                key={plan.name}
                className={cn(
                  "relative flex flex-col",
                  plan.highlighted && "border-[#5865F2] shadow-lg shadow-[#5865F2]/10 scale-[1.02]"
                )}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-0 right-0 mx-auto w-fit">
                    <Badge className="bg-[#5865F2] hover:bg-[#5865F2]">Mais popular</Badge>
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <div className="mt-3">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground ml-1">{plan.period}</span>
                  </div>
                  <CardDescription className="mt-1">{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <ul className="space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3 text-sm">
                        <Check className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    asChild
                    variant={plan.highlighted ? "default" : "outline"}
                    className="w-full"
                  >
                    <Link href={plan.href}>{plan.cta}</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-[#1a0a2e]/30 to-background" />
        <div className="relative z-10 container text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Pronto para transformar seu servidor?
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto">
            Junte-se a centenas de servidores que já confiam no ARX Store. Comece gratuitamente hoje.
          </p>
          <div className="mt-8">
            <Button asChild size="lg" className="px-8 h-12 text-base">
              <Link href="/login">
                Criar conta gratuita
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} ARX Store. Todos os direitos reservados.</p>
          <div className="flex items-center gap-6">
            <Link href="/planos" className="hover:text-foreground transition-colors">Planos</Link>
            <Link href="#" className="hover:text-foreground transition-colors">Termos de Uso</Link>
            <Link href="#" className="hover:text-foreground transition-colors">Privacidade</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
