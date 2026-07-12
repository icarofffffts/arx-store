import { getAuthSession } from "@/lib/session"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils"
import { cn } from "@/lib/utils"
import { Crown, Check, Bot, Server } from "lucide-react"

const PLANS = [
  {
    id: "free",
    name: "Free",
    price: 0,
    features: [
      "1 bot Discord",
      "1 servidor",
      "Comandos básicos",
      "Dashboard web",
      "Suporte da comunidade",
    ],
    botLimit: 1,
    guildLimit: 1,
  },
  {
    id: "premium",
    name: "Premium",
    price: 29.90,
    features: [
      "5 bots Discord",
      "5 servidores",
      "Comandos avançados",
      "Dashboard completo",
      "Logs personalizados",
      "Suporte prioritário",
      "Customização avançada",
    ],
    botLimit: 5,
    guildLimit: 5,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 79.90,
    features: [
      "Bots ilimitados",
      "Servidores ilimitados",
      "Todos os comandos",
      "API acesso total",
      "Logs avançados",
      "Suporte 24/7",
      "White-label",
      "SLA garantido",
    ],
    botLimit: Infinity,
    guildLimit: Infinity,
  },
]

export default async function PlansPage() {
  const session = (await getAuthSession()) as {
    user: {
      name?: string | null
      email?: string | null
      discordId?: string | null
    }
  } | null

  if (!session) return null

  const supabase = createClient()
  const discordId = session.user.discordId

  let currentPlan = "free"
  let userEmail = session.user.email || ""

  if (discordId) {
    const { data: user } = await supabase
      .schema("store")
      .from("users")
      .select("id, email")
      .eq("discord_id", discordId)
      .maybeSingle()

    if (user?.email) userEmail = user.email

    if (user) {
      const { data: sub } = await supabase
        .schema("store")
        .from("subscriptions")
        .select("plans(slug)")
        .eq("user_id", user.id)
        .eq("status", "active")
        .maybeSingle()

      const planSlug = (sub as any)?.plans?.slug
      if (planSlug) currentPlan = planSlug
    }
  }

  return (
    <div className="animate-in space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Planos</h1>
        <p className="text-muted-foreground mt-1">
          Escolha o plano ideal para você
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {PLANS.map((plan) => {
          const isCurrent = plan.id === currentPlan

          return (
            <Card
              key={plan.id}
              className={cn(
                "glass relative flex flex-col",
                isCurrent && "border-[#5865F2] ring-1 ring-[#5865F2]/50"
              )}
            >
              {isCurrent && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-[#5865F2] hover:bg-[#5865F2]">
                    <Crown className="mr-1 h-3 w-3" />
                    Seu Plano
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center">
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>
                  <span className="text-4xl font-bold text-foreground">
                    {formatCurrency(plan.price)}
                  </span>
                  <span className="text-muted-foreground">
                    {plan.price > 0 ? "/mês" : ""}
                  </span>
                </CardDescription>
              </CardHeader>

              <CardContent className="flex-1 space-y-4">
                <div className="flex gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Bot className="h-4 w-4" />
                    {plan.botLimit === Infinity
                      ? "Ilimitado"
                      : `${plan.botLimit} bot${plan.botLimit > 1 ? "s" : ""}`}
                  </span>
                  <span className="flex items-center gap-1">
                    <Server className="h-4 w-4" />
                    {plan.guildLimit === Infinity
                      ? "Ilimitado"
                      : `${plan.guildLimit} servidor${plan.guildLimit > 1 ? "es" : ""}`}
                  </span>
                </div>

                <ul className="space-y-2">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-2 text-sm"
                    >
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter>
                {isCurrent ? (
                  <Button className="w-full" disabled>
                    Plano Atual
                  </Button>
                ) : plan.id === "free" ? (
                  <form action="/api/mercadopago/downgrade" method="POST" className="w-full">
                    <input type="hidden" name="plan" value="free" />
                    <input type="hidden" name="email" value={userEmail} />
                    <Button variant="outline" className="w-full" type="submit">
                      Mudar para Free
                    </Button>
                  </form>
                ) : (
                  <form
                    action="/api/mercadopago/create-subscription"
                    method="POST"
                    className="w-full"
                  >
                    <input type="hidden" name="plan" value={plan.id} />
                    <input type="hidden" name="email" value={userEmail} />
                    <Button className="w-full" type="submit">
                      {currentPlan === "free" ? "Assinar" : "Fazer Upgrade"}
                    </Button>
                  </form>
                )}
              </CardFooter>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
