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
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Mail, User, Link2, Bell } from "lucide-react"

export default async function SettingsPage() {
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
  const userEmail = session.user.email || ""
  const userImage = session.user.image
  const discordLinked = Boolean(session.user.discordId)
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID || ""
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  const discordAuthUrl = DISCORD_CLIENT_ID
    ? `https://discord.com/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(
        `${SITE_URL}/api/auth/callback/discord`
      )}&scope=identify+email+guilds`
    : "#"

  return (
    <div className="animate-in max-w-2xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground mt-1">
          Gerencie sua conta e preferências
        </p>
      </div>

      <Card className="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Perfil
          </CardTitle>
          <CardDescription>
            Informações da sua conta
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={userImage || undefined} alt={userName} />
              <AvatarFallback className="bg-[#5865F2] text-lg text-white">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-xl font-semibold">{userName}</p>
              <p className="text-sm text-muted-foreground">{userEmail}</p>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">{userEmail}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Link2 className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Discord</p>
                  <p className="text-sm text-muted-foreground">
                    {discordLinked ? "Vinculado" : "Não vinculado"}
                  </p>
                </div>
              </div>
              {discordLinked ? (
                <Badge variant="success">Vinculado</Badge>
              ) : (
                <a href={discordAuthUrl}>
                  <Button size="sm" variant="outline">
                    Vincular Discord
                  </Button>
                </a>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notificações
          </CardTitle>
          <CardDescription>
            Configure suas preferências de notificação
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email-notifs" className="text-sm">
                Notificações por email
              </Label>
              <p className="text-xs text-muted-foreground">
                Receba atualizações sobre seus bots e faturamento
              </p>
            </div>
            <Switch id="email-notifs" defaultChecked />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="bot-alerts" className="text-sm">
                Alertas de bots
              </Label>
              <p className="text-xs text-muted-foreground">
                Notificações quando bots ficarem offline
              </p>
            </div>
            <Switch id="bot-alerts" defaultChecked />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="marketing" className="text-sm">
                Novidades e ofertas
              </Label>
              <p className="text-xs text-muted-foreground">
                Receba atualizações sobre novos recursos e promoções
              </p>
            </div>
            <Switch id="marketing" defaultChecked={false} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
