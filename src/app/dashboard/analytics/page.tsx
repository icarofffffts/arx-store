import { getAuthSession } from "@/lib/session"
import { createAdminClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { TrendingUp, TrendingDown, Users, Bot, ShoppingCart, CreditCard } from "lucide-react"

export const revalidate = 300

interface MetricCardProps {
  label: string
  value: string | number
  sub?: string
  icon: typeof TrendingUp
  iconColor?: string
  trend?: number
}

function MetricCard({ label, value, sub, icon: Icon, iconColor = "text-primary", trend }: MetricCardProps) {
  return (
    <Card className="border-outline-variant bg-surface-container-low">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-3">
          <div className={cn("flex h-10 w-10 items-center justify-center rounded", `bg-primary/20`)}>
            <Icon className={cn("h-5 w-5", iconColor)} />
          </div>
          {trend !== undefined && (
            <div className={cn("flex items-center gap-1 text-xs font-medium", trend >= 0 ? "text-green-400" : "text-red-400")}>
              {trend >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {Math.abs(trend)}%
            </div>
          )}
        </div>
        <p className="text-2xl font-bold text-on-surface">{value}</p>
        <p className="text-sm text-on-surface-variant mt-0.5">{label}</p>
        {sub && <p className="text-xs text-on-surface-variant/60 mt-0.5">{sub}</p>}
      </CardContent>
    </Card>
  )
}

interface BotStat {
  slug: string
  label: string
  count: number
  pct: number
}

export default async function AnalyticsPage() {
  const session = (await getAuthSession()) as { user: { discordId?: string | null } } | null
  if (!session?.user) return null

  const supabase = createAdminClient()

  const { data: guilds } = await supabase
    .schema("store")
    .from("guilds")
    .select("id, owner_user_id")
    .eq("owner_user_id", session.user.discordId!)

  const guildIds = (guilds || []).map((g: any) => g.id)

  let totalBots = 0
  let totalOrders = 0
  let totalRevenue = 0
  let activeSubscriptions = 0
  let botStats: BotStat[] = []

  if (guildIds.length > 0) {
    const [{ count: botCount }, { count: orderCount }, { data: invoices }, { count: subCount }] = await Promise.all([
      supabase.schema("store").from("guild_bots").select("*", { count: "exact", head: true }).in("guild_id", guildIds),
      supabase.schema("store").from("custom_bot_orders").select("*", { count: "exact", head: true }).in("guild_id", guildIds),
      supabase.schema("store").from("invoices").select("amount_cents").in("user_id", guildIds).eq("status", "approved"),
      supabase.schema("store").from("subscriptions").select("*", { count: "exact", head: true }).eq("status", "active").in("user_id", guildIds),
    ])
    totalBots = botCount ?? 0
    totalOrders = orderCount ?? 0
    activeSubscriptions = subCount ?? 0
    totalRevenue = (invoices || []).reduce((sum: number, inv: any) => sum + (inv.amount_cents || 0), 0) / 100

    const { data: botGroups } = await supabase
      .schema("store")
      .from("guild_bots")
      .select("bot_slug")
      .in("guild_id", guildIds)

    const counts: Record<string, number> = {}
    for (const b of botGroups || []) {
      counts[b.bot_slug] = (counts[b.bot_slug] || 0) + 1
    }
    const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1
    const labels: Record<string, string> = {
      "promisse-tickets": "🎫 Promisse Tickets",
      "vendas-ghost-studio": "🛒 Vendas Ghost Studio",
      "custom_bot": "⭐ Bot Personalizado",
    }
    botStats = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([slug, count]) => ({
        slug,
        label: labels[slug] || slug,
        count,
        pct: Math.round((count / total) * 100),
      }))
  }

  const formattedRevenue = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(totalRevenue)

  return (
    <div className="animate-in space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground mt-1">
          Visão geral da sua atividade na ARX Store.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Receita Total" value={formattedRevenue} icon={CreditCard} iconColor="text-green-400" />
        <MetricCard label="Bots Ativos" value={totalBots} sub="implantados" icon={Bot} iconColor="text-primary" />
        <MetricCard label="Pedidos" value={totalOrders} icon={ShoppingCart} iconColor="text-yellow-400" />
        <MetricCard label="Assinaturas Ativas" value={activeSubscriptions} icon={Users} iconColor="text-blue-400" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="border-outline-variant bg-surface-container-low">
          <CardHeader>
            <CardTitle className="text-base">Bots por Tipo</CardTitle>
          </CardHeader>
          <CardContent>
            {botStats.length === 0 ? (
              <p className="text-sm text-on-surface-variant py-4 text-center">Sem dados ainda.</p>
            ) : (
              <div className="space-y-3">
                {botStats.map((s) => (
                  <div key={s.slug}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-medium text-on-surface">{s.label}</span>
                      <span className="text-xs text-on-surface-variant">{s.count} ({s.pct}%)</span>
                    </div>
                    <div className="h-2 bg-surface-container-high rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${s.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-outline-variant bg-surface-container-low">
          <CardHeader>
            <CardTitle className="text-base">Resumo Geral</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-surface-container rounded-lg border border-outline-variant">
                <p className="text-2xl font-bold text-on-surface">{guildIds.length}</p>
                <p className="text-xs text-on-surface-variant mt-0.5">Servidores</p>
              </div>
              <div className="p-4 bg-surface-container rounded-lg border border-outline-variant">
                <p className="text-2xl font-bold text-on-surface">{totalBots}</p>
                <p className="text-xs text-on-surface-variant mt-0.5">Bots Total</p>
              </div>
              <div className="p-4 bg-surface-container rounded-lg border border-outline-variant">
                <p className="text-2xl font-bold text-on-surface">{totalOrders}</p>
                <p className="text-xs text-on-surface-variant mt-0.5">Pedidos Feitos</p>
              </div>
              <div className="p-4 bg-surface-container rounded-lg border border-outline-variant">
                <p className="text-2xl font-bold text-primary">{formattedRevenue}</p>
                <p className="text-xs text-on-surface-variant mt-0.5">Faturado</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}