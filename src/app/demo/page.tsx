'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { BOT_PRODUCTS } from '@/lib/pricing'
import {
  Ticket,
  ShoppingCart,
  Send,
  Loader2,
  CheckCircle,
  ArrowRight,
  MessageSquare,
  Users,
  Zap,
} from 'lucide-react'

const ICON_MAP: Record<string, React.ReactNode> = {
  ticket: <Ticket className="h-6 w-6 text-primary" />,
  shopping: <ShoppingCart className="h-6 w-6 text-primary" />,
}

export default function CapturarLeadPage() {
  const searchParams = useSearchParams()
  const preselectedBot = searchParams.get('bot') || ''

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    discord_server: '',
    discord_id: '',
    bot_interest: preselectedBot,
    server_size: '',
    message: '',
  })
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!formData.name || !formData.bot_interest) return

    setLoading(true)
    try {
      const res = await fetch('/api/store/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          source: 'website',
          utm_campaign: searchParams.get('utm_campaign') || '',
        }),
      })

      if (res.ok) {
        setSubmitted(true)
      } else {
        const err = await res.json()
        alert(err.error || 'Erro ao enviar')
      }
    } catch (e: any) {
      alert(e.message || 'Erro ao enviar')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="glass max-w-md w-full text-center">
          <CardHeader>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 mb-4">
              <CheckCircle className="h-8 w-8 text-emerald-500" />
            </div>
            <CardTitle className="text-2xl">Obrigado!</CardTitle>
            <CardDescription>
              Recebemos seu interesse. Nossa equipe entrará em contato em breve.
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex flex-col gap-2">
            <Link href="/produtos" className="w-full">
              <Button className="w-full">
                Ver Produtos
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/" className="w-full">
              <Button variant="ghost" className="w-full">
                Voltar para home
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="mx-auto max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Quer um bot para seu servidor?</h1>
          <p className="text-muted-foreground mt-2">
            Preencha o formulário e nossa equipe entrará em contato com você.
          </p>
        </div>

        <Card className="glass">
          <CardHeader>
            <CardTitle>Fale com a gente</CardTitle>
            <CardDescription>
              Conte um pouco sobre seu servidor e qual bot te interessa.
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Seu nome *</Label>
                <Input
                  id="name"
                  placeholder="Como podemos te chamar?"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              {/* Discord Server */}
              <div className="space-y-2">
                <Label htmlFor="discord_server">Nome do servidor Discord</Label>
                <Input
                  id="discord_server"
                  placeholder="Ex: Meu Servidor"
                  value={formData.discord_server}
                  onChange={(e) => setFormData({ ...formData, discord_server: e.target.value })}
                />
              </div>

              {/* Discord ID */}
              <div className="space-y-2">
                <Label htmlFor="discord_id">Seu Discord (username#0000 ou @user)</Label>
                <Input
                  id="discord_id"
                  placeholder="Ex: @seuuser"
                  value={formData.discord_id}
                  onChange={(e) => setFormData({ ...formData, discord_id: e.target.value })}
                />
              </div>

              {/* Bot Interest */}
              <div className="space-y-2">
                <Label htmlFor="bot_interest">Qual bot te interessa? *</Label>
                <Select
                  value={formData.bot_interest}
                  onValueChange={(v) => setFormData({ ...formData, bot_interest: v })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um bot" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="arx-ticket">
                      <div className="flex items-center gap-2">
                        <Ticket className="h-4 w-4" />
                        ARX Ticket - Sistema de tickets com pagamento
                      </div>
                    </SelectItem>
                    <SelectItem value="arx-shop">
                      <div className="flex items-center gap-2">
                        <ShoppingCart className="h-4 w-4" />
                        ARX Shop - Loja completa no Discord
                      </div>
                    </SelectItem>
                    <SelectItem value="both">
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4" />
                        Os dois!
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Server Size */}
              <div className="space-y-2">
                <Label htmlFor="server_size">Tamanho do servidor</Label>
                <Select
                  value={formData.server_size}
                  onValueChange={(v) => setFormData({ ...formData, server_size: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Quantos membros?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Até 500 membros</SelectItem>
                    <SelectItem value="medium">500 - 5.000 membros</SelectItem>
                    <SelectItem value="large">5.000+ membros</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Message */}
              <div className="space-y-2">
                <Label htmlFor="message">Mensagem (opcional)</Label>
                <Textarea
                  id="message"
                  placeholder="Conte mais sobre o que precisa..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows={3}
                />
              </div>
            </CardContent>

            <CardFooter>
              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={loading || !formData.name || !formData.bot_interest}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Quero saber mais
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>

        {/* Bot Cards */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {BOT_PRODUCTS.map((product) => (
            <Card key={product.slug} className="glass">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    {ICON_MAP[product.icon]}
                  </div>
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-xs text-muted-foreground">{product.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
