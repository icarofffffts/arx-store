import Link from "next/link"
import { getAuthSession } from "@/lib/session"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/server"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { formatDate } from "@/lib/utils"
import { cn } from "@/lib/utils"
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

interface BotRecord {
  id: string
  client_id: string
  name: string
  avatar_url: string | null
  guild_id: string
  guild_name: string
  status: string
  last_active: string | null
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
  const supabase = createClient()
  const adminClient = createAdminClient()

  const userId = session.user.discordId || session.user.email

  const [userRes, botsRes] = await Promise.all([
    userId
      ? supabase
          .schema("arx_store")
          .from("platform_users")
          .select("plan, subscription_id, subscription_status")
          .or(
            userId.includes("@")
              ? `email.eq.${userId}`
              : `discord_id.eq.${userId}`
          )
          .maybeSingle()
      : Promise.resolve({ data: null }),
    adminClient
      .schema("arx_store")
      .from("bots")
      .select("*")
      .order("created_at", { ascending: false }),
  ])

  const user = userRes.data
  const bots = (botsRes.data || []) as BotRecord[]

  const userPlan = user?.plan || "free"
  const activeBots = bots.filter((b) => b.status === "online").length
  const serverCount = Array.from(new Set(bots.map((b) => b.guild_id))).length

  const planLabel =
    userPlan === "enterprise"
      ? "Enterprise"
      : userPlan === "premium"
        ? "Premium"
        : "Free"

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
            <div className="text-2xl font-bold">{serverCount}</div>
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
              Próxima Fatura
            </CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {user?.subscription_id ? formatDate(new Date()) : "---"}
            </div>
            <p className="text-xs text-muted-foreground">
              {user?.subscription_status === "active"
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
            <Link href="/dashboard/bots/personalizado">
              <Button size="sm">
                <Plus className="mr-1 h-4 w-4" />
                Ativar Bot
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
              <Link href="/dashboard/bots/personalizado">
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
                      {bot.avatar_url ? (
                        <img
                          src={bot.avatar_url}
                          alt={bot.name}
                          className="h-10 w-10 rounded-full"
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#5865F2]/20">
                          <Bot className="h-5 w-5 text-[#5865F2]" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium truncate">{bot.name}</p>
                          <Circle
                            className={cn(
                              "h-2 w-2 fill-current",
                              bot.status === "online"
                                ? "text-emerald-500"
                                : "text-muted-foreground"
                            )}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {bot.guild_name}
                        </p>
                        {bot.last_active && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Ativo {formatDate(bot.last_active)}
                          </p>
                        )}
                        <div className="mt-2">
                          <Link
                            href={`/dashboard/bots/${bot.client_id}`}
                            className="text-xs text-[#5865F2] hover:underline inline-flex items-center gap-1"
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
              <Link href="/dashboard/bots/personalizado" className="block">
                <Button variant="default" className="w-full justify-start">
                  <Plus className="mr-2 h-4 w-4" />
                  Ativar Bot
                </Button>
              </Link>
              <Link href="/loja" className="block">
                <Button variant="outline" className="w-full justify-start">
                  <ShoppingBag className="mr-2 h-4 w-4" />
                  Ver Loja
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
