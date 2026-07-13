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
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#5865F2]/20">
                    <Bot className="h-5 w-5 text-[#5865F2]" />
                  </div>
                  <div>
                    <p className="font-semibold">{bot.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {bot.description}
                    </p>
                    <Badge variant="outline" className="mt-1 text-xs">
                      {bot.category}
                    </Badge>
                  </div>
                </div>
                <div>
                  {bot.isActive ? (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deactivateBot(bot.guildBotId!, bot.slug)}
                      disabled={loading === bot.slug}
                    >
                      {loading === bot.slug ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <X className="h-4 w-4" />
                      )}
                      <span className="ml-1">Desativar</span>
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => activateBot(bot.slug, bot.name)}
                      disabled={loading === bot.slug}
                    >
                      {loading === bot.slug ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Check className="h-4 w-4" />
                      )}
                      <span className="ml-1">Ativar</span>
                    </Button>
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
