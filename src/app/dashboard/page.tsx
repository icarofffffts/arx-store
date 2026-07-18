import Link from "next/link"
import { getAuthSession } from "@/lib/session"
import { createClient } from "@/lib/supabase/server"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn, formatPlanLabel } from "@/lib/utils"
import {
  Activity,
  Server,
  Crown,
  CreditCard,
  Bot,
  ShoppingBag,
  Plus,
  Settings,
  Circle,
} from "lucide-react"

interface GuildBot {
  id: string
  bot_slug: string
  bot_name: string | null
  guild_id: string
  guild_name: string | null
  status: string
  created_at: string
}

export default async function DashboardPage() {
  const session = (await getAuthSession()) as {
    user: {
      name?: string | null
      email?: string | null
      image?: string | null
      discordId?: string | null
    }
  } | null

  if (!session) return null

  const userName = session.user.name || "Usuário"
  const discordId = session.user.discordId
  const supabase = createClient()

  let userPlan = "free"
  let subscriptionStatus: string | null = null
  let bots: GuildBot[] = []
  let activeBots = 0

  if (discordId) {
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
        .select("id, status, plan:plan_id(slug)")
        .eq("user_id", user.id)
        .eq("status", "active")
        .maybeSingle()

      const planSlug = (sub as any)?.plan?.slug
      if (planSlug) {
        userPlan = planSlug
        subscriptionStatus = (sub as any)?.status || null
      }

      if (sub) {
        const { data: guildBots } = await supabase
          .schema("store")
          .from("guild_bots")
          .select("id, bot_slug, bot_name, guild_id, status, created_at, guilds(name)")
          .eq("subscription_id", sub.id)
          .order("created_at", { ascending: false })

        bots = (guildBots || []).map((b: any) => ({
          id: b.id,
          bot_slug: b.bot_slug,
          bot_name: b.bot_name,
          guild_id: b.guild_id,
          guild_name: b.guilds?.name || "Desconhecido",
          status: b.status,
          created_at: b.created_at,
        }))

        activeBots = bots.filter((b) => b.status === "active").length
      }
    }
  }

  const planLabel = formatPlanLabel(userPlan)

  return (
    <div className="animate-in space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Bem-vindo, {userName}
        </h1>
        <p className="text-muted-foreground mt-1">
          Gerencie seus bots e servidores
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="glass">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bots Ativos</CardTitle>
            <Activity className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeBots}</div>
            <p className="text-xs text-muted-foreground">
              de {bots.length} total
            </p>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Servidores</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(bots.map((b) => b.guild_id)).size}
            </div>
            <p className="text-xs text-muted-foreground">guilds com bots</p>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Plano Atual</CardTitle>
            <Crown className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <Badge
              variant={
                userPlan === "enterprise"
                  ? "default"
                  : userPlan === "premium"
                    ? "success"
                    : "secondary"
              }
            >
              {planLabel}
            </Badge>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Status
            </CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {subscriptionStatus === "active" ? "Ativa" : "---"}
            </div>
            <p className="text-xs text-muted-foreground">
              {subscriptionStatus === "active"
                ? "Assinatura ativa"
                : "Sem assinatura"}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Seus Bots</h2>
            <Link href="/dashboard/servidores">
              <Button size="sm">
                <Plus className="mr-1 h-4 w-4" />
                Adicionar Bot
              </Button>
            </Link>
          </div>

          {bots.length === 0 ? (
            <Card className="glass flex flex-col items-center justify-center py-12">
              <Bot className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">
                Nenhum bot encontrado
              </h3>
              <p className="text-sm text-muted-foreground mt-1 mb-6">
                Ative seu primeiro bot para começar
              </p>
              <Link href="/dashboard/servidores">
                <Button>
                  <Plus className="mr-1 h-4 w-4" />
                  Ativar seu primeiro bot
                </Button>
              </Link>
            </Card>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {bots.map((bot) => (
                <Card key={bot.id} className="glass">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/10">
                        <Bot className="h-5 w-5 text-red-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium truncate">
                            {bot.bot_name || bot.bot_slug}
                          </p>
                          <Circle
                            className={cn(
                              "h-2 w-2 fill-current",
                              bot.status === "active"
                                ? "text-emerald-500"
                                : "text-muted-foreground"
                            )}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {bot.guild_name}
                        </p>
                        <div className="mt-2">
                          <Link
                            href={`/dashboard/servidores`}
                            className="text-xs text-red-500 hover:underline inline-flex items-center gap-1"
                          >
                            <Settings className="h-3 w-3" />
                            Configurar
                          </Link>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Ações Rápidas</h2>
          <Card className="glass">
            <CardContent className="space-y-3 p-4">
              <Link href="/dashboard/servidores" className="block">
                <Button variant="default" className="w-full justify-start">
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar Bot
                </Button>
              </Link>
              <Link href="/dashboard/planos" className="block">
                <Button variant="outline" className="w-full justify-start">
                  <ShoppingBag className="mr-2 h-4 w-4" />
                  Ver Planos
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
