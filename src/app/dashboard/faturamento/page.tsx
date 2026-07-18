import { getAuthSession } from "@/lib/session"
import { createAdminClient } from "@/lib/supabase/server"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatCurrency, formatDate, formatPlanLabel } from "@/lib/utils"
import {
  CreditCard,
  Calendar,
  Receipt,
} from "lucide-react"
import { CancelSubscriptionDialog } from "./_components/cancel-dialog"

interface InvoiceRecord {
  id: string
  created_at: string
  amount_cents: number
  status: string
}

export default async function BillingPage() {
  const session = (await getAuthSession()) as {
    user: {
      name?: string | null
      email?: string | null
      discordId?: string | null
    }
  } | null

  if (!session) return null

  const supabase = createAdminClient()
  const discordId = session.user.discordId

  let currentPlan = "free"
  let subscriptionStatus: string | null = null
  let subscriptionEnd: string | null = null
  let hasActiveSubscription = false
  let invoices: InvoiceRecord[] = []
  let planPrice: number | null = 0

  if (discordId) {
    try {
      const { data: user } = await supabase
        .schema("store")
        .from("users")
        .select("id")
        .eq("discord_id", discordId)
        .maybeSingle()

      if (user) {
        const { data: sub } = await supabase
          .schema("store")
          .from("subscriptions")
          .select("id, status, current_period_end, plan:plan_id(slug, price_cents)")
          .eq("user_id", user.id)
          .eq("status", "active")
          .maybeSingle()

        if (sub) {
          const planSlug = (sub as any)?.plan?.slug
          if (planSlug) currentPlan = planSlug
          subscriptionStatus = (sub as any)?.status
          subscriptionEnd = (sub as any)?.current_period_end || null
          hasActiveSubscription = true
          const priceCents = (sub as any)?.plan?.price_cents
          planPrice = priceCents != null ? priceCents / 100 : null
        }

        const { data: invoiceData } = await supabase
          .schema("store")
          .from("invoices")
          .select("id, created_at, amount_cents, status")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(20)

        invoices = (invoiceData || []) as InvoiceRecord[]
      }
    } catch {
      // gracefully handle query errors
    }
  }

  const planLabel = formatPlanLabel(currentPlan)

  const statusVariant = (status: string) =>
    status === "approved" || status === "paid"
      ? "success"
      : status === "pending"
        ? "warning"
        : status === "rejected"
          ? "destructive"
          : "secondary"

  const statusLabel = (status: string) =>
    status === "approved" || status === "paid"
      ? "Aprovado"
      : status === "pending"
        ? "Pendente"
        : status === "rejected"
          ? "Rejeitado"
          : status

  return (
    <div className="animate-in space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Faturamento</h1>
        <p className="text-muted-foreground mt-1">
          Gerencie sua assinatura e histórico de pagamentos
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="glass lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Assinatura
            </CardTitle>
            <CardDescription>
              Status atual da sua assinatura
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <div>
                <p className="text-sm text-muted-foreground">Plano</p>
                <p className="text-lg font-semibold">{planLabel}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge
                  variant={
                    subscriptionStatus === "active" ? "success" : "secondary"
                  }
                >
                  {subscriptionStatus === "active" ? "Ativa" : "Inativa"}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Próxima cobrança
                </p>
                <p className="text-lg font-semibold">
                  {subscriptionEnd
                    ? formatDate(subscriptionEnd)
                    : "---"}
                </p>
              </div>
            </div>
          </CardContent>
          {hasActiveSubscription ? (
            <CardFooter className="flex gap-2">
              {subscriptionStatus === "active" ? (
                <CancelSubscriptionDialog />
              ) : (
                <Button asChild>
                  <a href="/dashboard/planos">Ver Planos</a>
                </Button>
              )}
            </CardFooter>
          ) : (
            <CardFooter>
              <Button asChild>
                <a href="/dashboard/planos">Ver Planos</a>
              </Button>
            </CardFooter>
          )}
        </Card>

        <Card className="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Resumo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Plano atual</p>
              <p className="text-2xl font-bold">{planLabel}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                {planPrice != null && planPrice > 0
                  ? formatCurrency(planPrice) + "/mes"
                  : "Gratuito"}
              </p>
            </div>
            {subscriptionEnd && (
              <div>
                <p className="text-sm text-muted-foreground">Válido até</p>
                <p className="font-medium">{formatDate(subscriptionEnd)}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Histórico de Pagamentos
          </CardTitle>
        </CardHeader>
        <CardContent>
          {invoices.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Receipt className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                Nenhum pagamento registrado
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground">
                    <th className="pb-3 pr-4 font-medium">Data</th>
                    <th className="pb-3 pr-4 font-medium">Valor</th>
                    <th className="pb-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((invoice) => (
                    <tr key={invoice.id} className="border-b border-border/50">
                      <td className="py-3 pr-4">
                        {formatDate(invoice.created_at)}
                      </td>
                      <td className="py-3 pr-4">
                        {formatCurrency((invoice.amount_cents || 0) / 100)}
                      </td>
                      <td className="py-3">
                        <Badge
                          variant={statusVariant(invoice.status)}
                          className="text-xs"
                        >
                          {statusLabel(invoice.status)}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
