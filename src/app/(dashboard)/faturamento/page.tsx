import { getAuthSession } from "@/lib/session"
import { createClient } from "@/lib/supabase/server"
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { formatCurrency, formatDate } from "@/lib/utils"
import {
  CreditCard,
  Calendar,
  ArrowUpRight,
  AlertTriangle,
  Receipt,
} from "lucide-react"

interface PaymentRecord {
  id: string
  created_at: string
  plan: string
  amount: number
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

  const supabase = createClient()
  const userId = session.user.discordId || session.user.email

  const { data: user } = userId
    ? await supabase
        .schema("arx_store")
        .from("platform_users")
        .select(
          "plan, subscription_id, subscription_status, subscription_end_date"
        )
        .or(
          userId.includes("@")
            ? `email.eq.${userId}`
            : `discord_id.eq.${userId}`
        )
        .maybeSingle()
    : { data: null }

  const { data: payments } =
    await supabase
      .schema("arx_store")
      .from("payments")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20)

  const currentPlan = user?.plan || "free"
  const subscriptionId = user?.subscription_id
  const subscriptionStatus = user?.subscription_status
  const subscriptionEnd = user?.subscription_end_date

  const planLabel =
    currentPlan === "enterprise"
      ? "Enterprise"
      : currentPlan === "premium"
        ? "Premium"
        : "Free"

  const statusVariant = (status: string) =>
    status === "approved"
      ? "success"
      : status === "pending"
        ? "warning"
        : status === "rejected"
          ? "destructive"
          : "secondary"

  const statusLabel = (status: string) =>
    status === "approved"
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
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
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
                <p className="text-sm text-muted-foreground">ID</p>
                <p className="text-lg font-mono text-sm truncate">
                  {subscriptionId ? subscriptionId.slice(0, 12) + "..." : "---"}
                </p>
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
          {subscriptionId && (
            <CardFooter className="flex gap-2">
              {subscriptionStatus === "active" ? (
                <>
                  <form
                    action={`https://www.mercadopago.com.br/subscriptions/${subscriptionId}/edit`}
                    method="GET"
                    target="_blank"
                  >
                    <Button variant="outline" type="submit">
                      <ArrowUpRight className="mr-1 h-4 w-4" />
                      Gerenciar Assinatura
                    </Button>
                  </form>
                  <CancelSubscriptionDialog subscriptionId={subscriptionId} />
                </>
              ) : (
                <Button asChild>
                  <a href="/dashboard/planos">Ver Planos</a>
                </Button>
              )}
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
                {currentPlan === "free"
                  ? "Gratuito"
                  : formatCurrency(currentPlan === "premium" ? 29.9 : 79.9) + "/mês"}
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
          {!payments || payments.length === 0 ? (
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
                    <th className="pb-3 pr-4 font-medium">Plano</th>
                    <th className="pb-3 pr-4 font-medium">Valor</th>
                    <th className="pb-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {(payments as PaymentRecord[]).map((payment) => (
                    <tr key={payment.id} className="border-b border-border/50">
                      <td className="py-3 pr-4">
                        {formatDate(payment.created_at)}
                      </td>
                      <td className="py-3 pr-4 capitalize">
                        {payment.plan}
                      </td>
                      <td className="py-3 pr-4">
                        {formatCurrency(payment.amount)}
                      </td>
                      <td className="py-3">
                        <Badge
                          variant={statusVariant(payment.status)}
                          className="text-xs"
                        >
                          {statusLabel(payment.status)}
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

function CancelSubscriptionDialog({
  subscriptionId,
}: {
  subscriptionId: string
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="destructive">
          <AlertTriangle className="mr-1 h-4 w-4" />
          Cancelar Assinatura
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cancelar Assinatura</DialogTitle>
          <DialogDescription>
            Tem certeza que deseja cancelar sua assinatura? Você perderá acesso
            aos benefícios ao final do período atual.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogTrigger asChild>
            <Button variant="outline">Voltar</Button>
          </DialogTrigger>
          <form
            action={`/api/mercadopago/subscriptions/${subscriptionId}/cancel`}
            method="POST"
          >
            <Button variant="destructive" type="submit">
              Confirmar Cancelamento
            </Button>
          </form>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
