import Link from "next/link"
import { getAuthSession } from "@/lib/session"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Server, Users, Bot, Plus, Settings } from "lucide-react"

const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID || ""

export default async function ServersPage() {
  const session = (await getAuthSession()) as {
    user: {
      name?: string | null
      discordId?: string | null
      accessToken?: string | null
    }
  } | null

  if (!session) return null

  const guilds: Array<{
    id: string
    name: string
    icon: string | null
    owner: boolean
    permissions: string
    approximate_member_count?: number
  }> = []

  if (session.user.accessToken) {
    try {
      const res = await fetch("https://discord.com/api/v10/users/@me/guilds", {
        headers: { Authorization: `Bearer ${session.user.accessToken}` },
      })

      if (res.ok) {
        const data = await res.json()
        guilds.push(
          ...data.filter(
            (g: { permissions: string; owner: boolean }) =>
              g.owner || (BigInt(g.permissions) & BigInt(0x20)) === BigInt(0x20)
          )
        )
      }
    } catch {}
  }

  const inviteUrl = DISCORD_CLIENT_ID
    ? `https://discord.com/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&permissions=8&scope=bot%20applications.commands`
    : "#"

  return (
    <div className="animate-in space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Servidores</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie seus servidores Discord
          </p>
        </div>
        <a href={inviteUrl} target="_blank" rel="noopener noreferrer">
          <Button>
            <Plus className="mr-1 h-4 w-4" />
            Adicionar Bot
          </Button>
        </a>
      </div>

      {guilds.length === 0 ? (
        <Card className="glass flex flex-col items-center justify-center py-16">
          <Server className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">Nenhum servidor encontrado</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm text-center">
            Conecte sua conta Discord e adicione o bot a um servidor para
            começar a gerenciá-lo.
          </p>
          <a
            href={inviteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6"
          >
            <Button>
              <Plus className="mr-1 h-4 w-4" />
              Adicionar Bot a um Servidor
            </Button>
          </a>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {guilds.map((guild) => (
            <Card key={guild.id} className="glass">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  {guild.icon ? (
                    <img
                      src={`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png?size=128`}
                      alt={guild.name}
                      className="h-12 w-12 rounded-full"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#5865F2]/20">
                      <Server className="h-6 w-6 text-[#5865F2]" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{guild.name}</p>
                    {guild.approximate_member_count != null && (
                      <p className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                        <Users className="h-3 w-3" />
                        {guild.approximate_member_count.toLocaleString("pt-BR")}{" "}
                        membros
                      </p>
                    )}
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                      <Bot className="h-3 w-3" />0 bots ativos
                    </div>
                    <div className="mt-3 flex gap-2">
                      <Link href={`/dashboard/bots/personalizado?guild=${guild.id}`}>
                        <Button size="sm" variant="outline">
                          <Settings className="mr-1 h-3 w-3" />
                          Gerenciar Bots
                        </Button>
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
  )
}
