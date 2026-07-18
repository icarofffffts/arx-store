'use client'

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bot, Check, X, Loader2 } from "lucide-react"

interface BotInfo {
  slug: string
  name: string
  description: string
  category: string
  isActive: boolean
  guildBotId?: string
}

interface Props {
  guildId: string
  guildName: string
  bots: BotInfo[]
}

export function GuildBotsManager({ guildId, guildName, bots }: Props) {
  const [botStates, setBotStates] = useState(bots)
  const [loading, setLoading] = useState<string | null>(null)

  async function activateBot(botSlug: string, botName: string) {
    setLoading(botSlug)
    try {
      const res = await fetch("/api/store/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guild_id: guildId, bot_slug: botSlug, bot_name: botName }),
      })
      if (!res.ok) {
        const err = await res.json()
        alert(err.error || "Erro ao ativar bot")
        return
      }
      const data = await res.json()
      setBotStates((prev) =>
        prev.map((b) =>
          b.slug === botSlug ? { ...b, isActive: true, guildBotId: data.guild_bot?.id || data.bot_id } : b
        )
      )
    } catch (e: any) {
      alert(e.message || "Erro ao ativar bot")
    } finally {
      setLoading(null)
    }
  }

  async function deactivateBot(guildBotId: string, botSlug: string) {
    if (!confirm("Tem certeza que deseja desativar este bot?")) return
    setLoading(botSlug)
    try {
      const res = await fetch(`/api/store/bots/${guildBotId}`, { method: "DELETE" })
      if (!res.ok) {
        const err = await res.json()
        alert(err.error || "Erro ao desativar bot")
        return
      }
      setBotStates((prev) =>
        prev.map((b) =>
          b.slug === botSlug ? { ...b, isActive: false, guildBotId: undefined } : b
        )
      )
    } catch (e: any) {
      alert(e.message || "Erro ao desativar bot")
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/dashboard/servidores"
          className="text-sm text-muted-foreground hover:text-white"
        >
          &larr; Voltar para servidores
        </Link>
        <h1 className="text-2xl font-bold mt-2">{guildName}</h1>
        <p className="text-muted-foreground">
          Gerencie os bots deste servidor
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {botStates.map((bot) => (
          <Card key={bot.slug} className="glass">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/10">
                    <Bot className="h-5 w-5 text-red-500" />
                  </div>
                  <div>
                    <p className="font-semibold">{bot.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {bot.description}
                    </p>
                    <Badge variant="outline" className="mt-1 text-xs border-outline-variant text-muted-foreground">
                      {bot.category}
                    </Badge>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  {bot.isActive ? (
                    <Button
                      size="sm"
                      variant="destructive"
                      className="w-full bg-red-500/20 text-red-500 border border-red-500/50 hover:bg-red-500/30 font-medium"
                      onClick={() => deactivateBot(bot.guildBotId!, bot.slug)}
                      disabled={loading === bot.slug}
                    >
                      {loading === bot.slug ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-1" />
                      ) : (
                        <X className="h-4 w-4 mr-1" />
                      )}
                      <span>Desativar</span>
                    </Button>
                  ) : (
                    bot.slug === "custom_bot" ? (
                      <Button
                        size="sm"
                        className="w-full bg-surface-bright border border-outline-variant hover:bg-surface-container-highest text-primary"
                        onClick={() => window.open(`https://discord.com/oauth2/authorize?client_id=${process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID}`, "_blank", "noopener,noreferrer")}
                      >
                        <span>Adicionar Bot T.I</span>
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        className="w-full bg-primary text-white hover:bg-primary/90 shadow-[0_0_15px_rgba(225,29,72,0.3)] transition-all"
                        onClick={() => activateBot(bot.slug, bot.name)}
                        disabled={loading === bot.slug}
                      >
                        {loading === bot.slug ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-1" />
                        ) : (
                          <Check className="h-4 w-4 mr-1" />
                        )}
                        <span>Confirmar Instalação</span>
                      </Button>
                    )
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
