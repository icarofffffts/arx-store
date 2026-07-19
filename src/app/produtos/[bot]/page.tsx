'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import {
  getBotProduct,
  PRICING_TIERS,
  ADDONS,
  calculatePrice,
  formatPriceCents,
  type BotSlug,
  type DurationMonths,
} from '@/lib/pricing'
import {
  ArrowLeft,
  Ticket,
  ShoppingCart,
  Check,
  Loader2,
  QrCode,
  Copy,
  CheckCheck,
  Plus,
  Minus,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const ICON_MAP: Record<string, React.ReactNode> = {
  ticket: <Ticket className="h-12 w-12 text-primary" />,
  shopping: <ShoppingCart className="h-12 w-12 text-primary" />,
}

export default function BotProductPage() {
  const params = useParams()
  const botSlug = params.bot as BotSlug
  const product = getBotProduct(botSlug)

  const [duration, setDuration] = useState<DurationMonths>(1)
  const [whitelabel, setWhitelabel] = useState(false)
  const [ticketSystem, setTicketSystem] = useState(false)
  const [loading, setLoading] = useState(false)
  const [checkoutData, setCheckoutData] = useState<{
    qrCode: string
    copyPaste: string
    orderId: string
  } | null>(null)
  const [copied, setCopied] = useState(false)

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Bot não encontrado</h1>
          <p className="text-muted-foreground mt-2">
            O produto que você procura não existe.
          </p>
          <Link href="/produtos">
            <Button className="mt-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para produtos
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const { totalCents, breakdown } = calculatePrice(
    duration,
    whitelabel,
    product.allowTicketAddon && ticketSystem
  )

  async function handleCheckout() {
    if (!product) return
    setLoading(true)
    try {
      const res = await fetch('/api/store/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bot_name: product?.slug,
          duration_months: duration,
          whitelabel,
          ticket_system: product?.allowTicketAddon && ticketSystem,
          total_cents: totalCents,
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        alert(err.error || 'Erro ao criar pedido')
        return
      }

      const data = await res.json()
      if (data.qr_code && data.copy_paste) {
        setCheckoutData({
          qrCode: data.qr_code,
          copyPaste: data.copy_paste,
          orderId: data.order_id,
        })
      } else if (data.init_point) {
        window.location.href = data.init_point
      }
    } catch (e: any) {
      alert(e.message || 'Erro ao processar checkout')
    } finally {
      setLoading(false)
    }
  }

  function copyToClipboard() {
    if (checkoutData?.copyPaste) {
      navigator.clipboard.writeText(checkoutData.copyPaste)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <Link href="/produtos">
          <Button variant="ghost" size="sm" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        </Link>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Product Info */}
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                {ICON_MAP[product.icon]}
              </div>
              <div>
                <h1 className="text-3xl font-bold">{product.name}</h1>
                <p className="text-muted-foreground">{product.description}</p>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold">Recursos inclusos:</h3>
              <ul className="space-y-2">
                {product.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-lg bg-muted/50 p-4">
              <h3 className="font-semibold mb-2">Como funciona:</h3>
              <ol className="space-y-2 text-sm text-muted-foreground">
                <li>1. Escolha a duração e addons desejados</li>
                <li>2. Gere o QR code e pague via Pix</li>
                <li>3. Após confirmação, receba o link de ativação</li>
                <li>4. Ative seu bot no Discord usando o link</li>
              </ol>
            </div>
          </div>

          {/* Checkout Card */}
          <Card className="glass">
            <CardHeader>
              <CardTitle>Configurar Compra</CardTitle>
              <CardDescription>
                Escolha a duração e addons para o {product.name}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Duration */}
              <div className="space-y-2">
                <Label>Duração</Label>
                <Select
                  value={String(duration)}
                  onValueChange={(v) => setDuration(Number(v) as DurationMonths)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a duração" />
                  </SelectTrigger>
                  <SelectContent>
                    {PRICING_TIERS.map((tier) => (
                      <SelectItem key={tier.months} value={String(tier.months)}>
                        {tier.label} — {formatPriceCents(tier.priceCents)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Addons */}
              <div className="space-y-3">
                <Label>Addons opcionais</Label>

                <button
                  type="button"
                  onClick={() => setWhitelabel(!whitelabel)}
                  className={cn(
                    'w-full flex items-center justify-between rounded-lg border px-4 py-3 text-left transition-colors',
                    whitelabel
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:bg-accent'
                  )}
                >
                  <div>
                    <p className="font-medium">{ADDONS.whitelabel.label}</p>
                    <p className="text-sm text-muted-foreground">
                      +{formatPriceCents(ADDONS.whitelabel.priceCents)}
                    </p>
                  </div>
                  <div
                    className={cn(
                      'flex h-6 w-6 items-center justify-center rounded-full border',
                      whitelabel
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-muted-foreground'
                    )}
                  >
                    {whitelabel ? <Check className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                  </div>
                </button>

                {product.allowTicketAddon && (
                  <button
                    type="button"
                    onClick={() => setTicketSystem(!ticketSystem)}
                    className={cn(
                      'w-full flex items-center justify-between rounded-lg border px-4 py-3 text-left transition-colors',
                      ticketSystem
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:bg-accent'
                    )}
                  >
                    <div>
                      <p className="font-medium">{ADDONS.ticketSystem.label}</p>
                      <p className="text-sm text-muted-foreground">
                        +{formatPriceCents(ADDONS.ticketSystem.priceCents)}
                      </p>
                    </div>
                    <div
                      className={cn(
                        'flex h-6 w-6 items-center justify-center rounded-full border',
                        ticketSystem
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-muted-foreground'
                      )}
                    >
                      {ticketSystem ? <Check className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                    </div>
                  </button>
                )}
              </div>

              <Separator />

              {/* Price Breakdown */}
              <div className="space-y-2">
                {breakdown.map((line, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{line}</span>
                  </div>
                ))}
                <div className="flex justify-between items-center pt-2">
                  <span className="font-semibold">Total</span>
                  <span className="text-2xl font-bold text-primary">
                    {formatPriceCents(totalCents)}
                  </span>
                </div>
              </div>
            </CardContent>

            <CardFooter>
              {checkoutData ? (
                <div className="w-full space-y-4">
                  <div className="flex items-center gap-2">
                    <QrCode className="h-5 w-5 text-primary" />
                    <span className="font-medium">Pagamento via Pix</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-muted rounded-lg p-3 font-mono text-xs break-all">
                      {checkoutData.copyPaste}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={copyToClipboard}
                    >
                      {copied ? (
                        <CheckCheck className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    Pedido #{checkoutData.orderId.slice(0, 8)}. Após o pagamento, seu bot será liberado em até 5 minutos.
                  </p>

                  <Link href="/dashboard/meus-bots">
                    <Button variant="outline" className="w-full">
                      Ver meus bots
                    </Button>
                  </Link>
                </div>
              ) : (
                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleCheckout}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Gerando Pix...
                    </>
                  ) : (
                    <>
                      <QrCode className="mr-2 h-4 w-4" />
                      Pagar com Pix
                    </>
                  )}
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
