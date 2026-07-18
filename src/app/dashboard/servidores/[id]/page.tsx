import { getAuthSession } from "@/lib/session"
import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { GuildBotsManager } from "./guild-bots-manager"

const AVAILABLE_BOTS = [
  {
    slug: "promisse-tickets",
    name: "Ticket Premium",
    description: "Sistema completo de tickets com pagamento integrado.",
    category: "Vendas"
  },
  {
    slug: "vendas-ghost-studio",
    name: "E-Commerce",
    description: "Painel de vendas, carrinho, produtos e automacoes de entrega.",
    category: "Vendas"
  },
  {
    slug: "custom_bot",
    name: "Bot Personalizado",
    description: "Abra um ticket com a equipe de desenvolvimento para criar um bot sob medida.",
    category: "Desenvolvimento"
  }
]

export default async function GuildBotsPage({
  params,
}: {
  params: { id: string }
}) {
  const session = (await getAuthSession()) as {
    user: {
      name?: string | null
      discordId?: string | null
      accessToken?: string | null
    }
  } | null

  if (!session) return null

  const guildId = params.id
  const discordId = session.user.discordId

  let guildName = guildId
  let guildIcon: string | null = null

  if (session.user.accessToken) {
    try {
      const res = await fetch(
        `https://discord.com/api/v10/guilds/${guildId}`,
        {
          headers: { Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}` },
          next: { revalidate: 300 },
        } as RequestInit
      )
      if (res.ok) {
        const guild = await res.json()
        guildName = guild.name || guildId
        guildIcon = guild.icon || null
      }
    } catch {}
  }

  const bots: Array<{
    slug: string
    name: string
    description: string
    category: string
    isActive: boolean
    guildBotId?: string
  }> = []

  if (discordId) {
    const supabase = createClient()

    // Step 1: resolve user.id from discordId
    const { data: user } = await supabase
      .schema("store")
      .from("users")
      .select("id")
      .eq("discord_id", discordId)
      .maybeSingle()

    if (!user) return null

    // Step 2: verify user owns this guild
    const { data: guild } = await supabase
      .schema("store")
      .from("guilds")
      .select("id")
      .eq("guild_id", guildId)
      .eq("owner_user_id", user.id)
      .maybeSingle()

    if (!guild) return null

    // Step 3: fetch active subscription
    const { data: sub } = await supabase
      .schema("store")
      .from("subscriptions")
      .select("id, status")
      .eq("user_id", user.id)
      .eq("status", "active")
      .maybeSingle()

    const subId = (sub as any)?.id

    let activeBotsMap = new Map<string, string>()

    if (subId) {
      const { data: activeBots } = await supabase
        .schema("store")
        .from("guild_bots")
        .select("id, bot_slug")
        .eq("subscription_id", subId)
        .eq("status", "active")
        .limit(50)

      for (const bot of activeBots || []) {
        activeBotsMap.set(bot.bot_slug, bot.id)
      }
    }

    for (const bot of AVAILABLE_BOTS) {
      const isActive = activeBotsMap.has(bot.slug)
      bots.push({
        slug: bot.slug,
        name: bot.name || bot.slug,
        description: bot.description || "",
        category: bot.category || "Geral",
        isActive,
        guildBotId: isActive ? activeBotsMap.get(bot.slug) : undefined,
      })
    }
  }

  if (bots.length === 0) {
    return (
      <div className="animate-in space-y-6">
        <div>
          <a
            href="/dashboard/servidores"
            className="text-sm text-muted-foreground hover:text-white"
          >
            &larr; Voltar para servidores
          </a>
          <h1 className="text-2xl font-bold mt-2">{guildName}</h1>
        </div>
        <div className="glass flex flex-col items-center justify-center py-16 rounded-lg">
          <p className="text-muted-foreground">
            Nenhum bot disponível para este servidor.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="animate-in">
      <GuildBotsManager guildId={guildId} guildName={guildName} bots={bots} />
    </div>
  )
}
