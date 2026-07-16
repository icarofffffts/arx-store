import { getAuthSession } from "@/lib/session"
import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { GuildBotsManager } from "./guild-bots-manager"

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
  const supabase = createClient()

  let guildName = guildId
  let guildIcon: string | null = null

  if (session.user.accessToken) {
    try {
      const res = await fetch(
        `https://discord.com/api/v10/guilds/${guildId}`,
        {
          headers: { Authorization: `Bearer ${session.user.accessToken}` },
        }
      )

      if (res.ok) {
        const guild = await res.json()
        guildName = guild.name || guildId
        guildIcon = guild.icon || null
      }
    } catch {}
  }

  const discordId = session.user.discordId
  const bots: Array<{
    slug: string
    name: string
    description: string
    category: string
    isActive: boolean
    guildBotId?: string
  }> = []

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
        .select("id, plans(slug, features)")
        .eq("user_id", user.id)
        .eq("status", "active")
        .maybeSingle()

      const planFeatures = (sub as any)?.plans?.features

      const { data: dbGuild } = await supabase
        .schema("store")
        .from("guilds")
        .select("id")
        .eq("guild_id", guildId)
        .eq("owner_user_id", user.id)
        .maybeSingle()

      let activeBotsMap = new Map<string, string>()

      if (dbGuild && sub) {
        const { data: activeBots } = await supabase
          .schema("store")
          .from("guild_bots")
          .select("id, bot_slug")
          .eq("guild_id", dbGuild.id)
          .eq("subscription_id", sub.id)
          .eq("status", "active")

        for (const bot of activeBots || []) {
          activeBotsMap.set(bot.bot_slug, bot.id)
        }
      }

      // Hardcoded available bots since we no longer rely on settings.default_bots JSON
      // Customers manage sales of 'promisse-tickets', 'vendas-ghost-studio', 'custom_bot'
      const availableBots = [
        {
          slug: "promisse-tickets",
          name: "Ticket Premium",
          description: "Sistema completo de tickets com pagamento integrado.",
          category: "Vendas"
        },
        {
          slug: "vendas-ghost-studio",
          name: "E-Commerce",
          description: "Painel de vendas, carrinho, produtos e automações de entrega.",
          category: "Vendas"
        },
        {
          slug: "custom_bot",
          name: "Bot Personalizado",
          description: "Abra um ticket com a equipe de desenvolvimento para criar um bot sob medida.",
          category: "Desenvolvimento"
        }
      ];

      for (const bot of availableBots) {
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
