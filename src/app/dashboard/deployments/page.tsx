import { getAuthSession } from "@/lib/session"
import { createAdminClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn, formatDate } from "@/lib/utils"
import { Rocket, CheckCircle2, XCircle, Clock, Globe, Bot, GitBranch } from "lucide-react"

interface Deployment {
  id: string
  guild_id: string
  guild_name: string | null
  bot_slug: string
  bot_name: string | null
  status: string
  version: string | null
  deployed_at: string | null
}

const BOT_LABELS: Record<string, string> = {
  "arx-ticket": "🎫 ARX Ticket",
  "arx-shop": "🛒 ARX Shop",
  "custom_bot": "⭐ Bot Personalizado",
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: typeof CheckCircle2 }> = {
  active: { label: "Ativo", color: "text-green-400", icon: CheckCircle2 },
  inactive: { label: "Inativo", color: "text-red-400", icon: XCircle },
  deploying: { label: "Deploying", color: "text-yellow-400", icon: Clock },
  failed: { label: "Falhou", color: "text-red-400", icon: XCircle },
}

export default async function DeploymentsPage() {
  const session = (await getAuthSession()) as { user: { discordId?: string | null } } | null
  if (!session?.user) return null

  const supabase = createAdminClient()

  // Resolve discordId → user.id (UUID) before querying guilds
  const { data: user } = await supabase
    .schema("store")
    .from("users")
    .select("id")
    .eq("discord_id", session.user.discordId!)
    .maybeSingle()

  const { data: guilds } = user
    ? await supabase
        .schema("store")
        .from("guilds")
        .select("id, guild_id, name")
        .eq("owner_user_id", user.id)
    : { data: [] }

  const guildIds = (guilds || []).map((g: any) => g.id)

  let deployments: Deployment[] = []
  if (guildIds.length > 0) {
    const { data } = await supabase
      .schema("store")
      .from("guild_bots")
      .select("id, bot_slug, status, activated_at, guild:guild_id(id, name)")
      .in("guild_id", guildIds)
      .order("activated_at", { ascending: false })
    deployments = (data || []).map((d: any) => ({
      id: d.id,
      guild_id: d.guild?.id,
      guild_name: d.guild?.name,
      bot_slug: d.bot_slug,
      bot_name: BOT_LABELS[d.bot_slug] || d.bot_slug,
      status: d.status,
      version: d.config?.version as string | null ?? "1.0.0",
      deployed_at: d.activated_at,
    }))
  }

  const active = deployments.filter((d) => d.status === "active").length
  const total = deployments.length

  return (
    <div className="animate-in space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Deployments</h1>
        <p className="text-muted-foreground mt-1">
          Gerencie e monitore todos os bots implantados nos seus servidores.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="border-outline-variant bg-surface-container-low">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded bg-primary/20">
                <Rocket className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{total}</p>
                <p className="text-sm text-on-surface-variant">Total Deployments</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-outline-variant bg-surface-container-low">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded bg-green-500/20">
                <CheckCircle2 className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{active}</p>
                <p className="text-sm text-on-surface-variant">Ativos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-outline-variant bg-surface-container-low">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded bg-blue-500/20">
                <Globe className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{new Set(deployments.map((d) => d.guild_id)).size}</p>
                <p className="text-sm text-on-surface-variant">Servidores</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-outline-variant bg-surface-container-low">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Bot className="h-4 w-4" />
            Bots Implantados
          </CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          {deployments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Rocket className="h-12 w-12 text-on-surface-variant mb-3" />
              <p className="text-on-surface-variant font-medium">Nenhum bot implantado ainda.</p>
              <p className="text-sm text-on-surface-variant/60 mt-1">Ative bots em seus servidores para aparecerem aqui.</p>
            </div>
          ) : (
            <div className="space-y-0">
              {deployments.map((d, i) => {
                const statusCfg = STATUS_CONFIG[d.status] || STATUS_CONFIG.inactive
                const StatusIcon = statusCfg.icon
                return (
                  <div
                    key={d.id}
                    className={cn(
                      "flex items-center gap-4 px-6 py-4 border-b border-outline-variant/50 last:border-0",
                      "hover:bg-surface-container transition-colors"
                    )}
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded bg-surface-container-high border border-outline-variant">
                      <Bot className="h-5 w-5 text-on-surface-variant" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-semibold text-on-surface truncate">{d.bot_name}</p>
                        <Badge variant="outline" className="text-[10px] font-mono border-outline-variant text-on-surface-variant">
                          v{d.version}
                        </Badge>
                      </div>
                      <p className="text-xs text-on-surface-variant truncate">
                        {d.guild_name || d.guild_id}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusIcon className={cn("h-4 w-4", statusCfg.color)} />
                      <span className={cn("text-xs font-medium", statusCfg.color)}>{statusCfg.label}</span>
                    </div>
                    {d.deployed_at && (
                      <div className="flex items-center gap-1.5 text-xs text-on-surface-variant">
                        <GitBranch className="h-3 w-3" />
                        {formatDate(d.deployed_at)}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}