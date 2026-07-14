'use client'

import { useState } from "react"
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
import { formatCurrency, cn } from "@/lib/utils"
import { Crown, Check, Bot, Server, Loader2 } from "lucide-react"

interface Plan {
  id: string
  slug: string
  name: string
  description: string | null
  price_cents: number
  bot_limit: number
  max_guilds: number
  features: string[] | null
  is_active: boolean
}

interface Props {
  plans: Plan[]
  currentPlanSlug: string | null
}

export function PlansClient({ plans, currentPlanSlug }: Props) {
  const [loading, setLoading] = useState<string | null>(null)

  async function handleSubscribe(plan: Plan) {
    setLoading(plan.slug)
    try {
      const res = await fetch("/api/store/subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan_slug: plan.slug }),
      })

      if (!res.ok) {
        const err = await res.json()
        alert(err.error || "Erro ao processar assinatura")
        return
      }

      const data = await res.json()

      if (data.init_point) {
        window.location.href = data.init_point
      } else {
        window.location.reload()
      }
    } catch (e: any) {
      alert(e.message || "Erro ao processar assinatura")
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {plans.map((plan) => {
        const isCurrent = plan.slug === currentPlanSlug

        return (
          <Card
            key={plan.id}
            className={cn(
              "glass relative flex flex-col",
              isCurrent && "border-red-500 ring-1 ring-red-500/50"
            )}
          >
            {isCurrent && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-red-600 hover:bg-red-600">
                  <Crown className="mr-1 h-3 w-3" />
                  Seu Plano
                </Badge>
              </div>
            )}

            <CardHeader className="text-center">
              <CardTitle>{plan.name}</CardTitle>
              <CardDescription>
                <span className="text-4xl font-bold text-foreground">
                  {formatCurrency(plan.price_cents / 100)}
                </span>
                <span className="text-muted-foreground">
                  {plan.price_cents > 0 ? "/mês" : ""}
                </span>
              </CardDescription>
            </CardHeader>

            <CardContent className="flex-1 space-y-4">
              <div className="flex gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Bot className="h-4 w-4" />
                  {plan.bot_limit === 999
                    ? "Ilimitado"
                    : `${plan.bot_limit} bot${plan.bot_limit > 1 ? "s" : ""}`}
                </span>
                <span className="flex items-center gap-1">
                  <Server className="h-4 w-4" />
                  {plan.max_guilds === 999
                    ? "Ilimitado"
                    : `${plan.max_guilds} servidor${plan.max_guilds > 1 ? "es" : ""}`}
                </span>
              </div>

              {plan.features && plan.features.length > 0 && (
                <ul className="space-y-2">
                  {(typeof plan.features === "string"
                    ? JSON.parse(plan.features as string)
                    : plan.features
                  ).map((feature: any) => {
                    const label = typeof feature === "string" ? feature : feature?.label ?? feature?.name ?? feature?.slug ?? ""
                    return (
                    <li
                      key={typeof feature === "string" ? feature : feature?.slug ?? label}
                      className="flex items-start gap-2 text-sm"
                    >
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                      <span className="text-muted-foreground">{label}</span>
                    </li>
                    )
                  })}
                </ul>
              )}
            </CardContent>

            <CardFooter>
              {isCurrent ? (
                <Button className="w-full" disabled>
                  Plano Atual
                </Button>
              ) : plan.price_cents === 0 ? (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => handleSubscribe(plan)}
                  disabled={loading === plan.slug}
                >
                  {loading === plan.slug ? (
                    <>
                      <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    "Mudar para Free"
                  )}
                </Button>
              ) : (
                <Button
                  className="w-full"
                  onClick={() => handleSubscribe(plan)}
                  disabled={loading === plan.slug}
                >
                  {loading === plan.slug ? (
                    <>
                      <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                      Processando...
                    </>
                  ) : currentPlanSlug === "free" ? (
                    "Assinar"
                  ) : (
                    "Fazer Upgrade"
                  )}
                </Button>
              )}
            </CardFooter>
          </Card>
        )
      })}
    </div>
  )
}
