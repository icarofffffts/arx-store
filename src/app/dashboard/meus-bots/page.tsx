'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Package,
  ArrowRight,
  Loader2,
  Copy,
  CheckCheck,
  ExternalLink,
  Clock,
  CheckCircle,
  AlertCircle,
  ShoppingBag,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Order {
  id: string
  bot_slug: string
  bot_name: string
  status: string
  status_label: string
  total_price: number
  duration_label: string
  whitelabel: boolean
  ticket_enabled: boolean
  created_at: string
  paid_at: string | null
  deployed_at: string | null
  mp_payment_id?: string
}

export default function MeusBotsPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  useEffect(() => {
    fetchOrders()
  }, [])

  async function fetchOrders() {
    try {
      const res = await fetch('/api/store/orders')
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setOrders(data.orders || [])
    } catch (err) {
      console.error('Error fetching orders:', err)
    } finally {
      setLoading(false)
    }
  }

  function copyActivationLink(orderId: string) {
    const link = `https://discord.com/channels/@me/123456789/activate?order=${orderId}`
    navigator.clipboard.writeText(link)
    setCopiedId(orderId)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
    awaiting_payment: { label: 'Aguardando pagamento', color: 'bg-yellow-500/10 text-yellow-500', icon: <Clock className="h-4 w-4" /> },
    pending: { label: 'Aguardando pagamento', color: 'bg-yellow-500/10 text-yellow-500', icon: <Clock className="h-4 w-4" /> },
    paid: { label: 'Pago - Aguardando ativação', color: 'bg-blue-500/10 text-blue-500', icon: <CheckCircle className="h-4 w-4" /> },
    deploying: { label: 'Em deploy', color: 'bg-purple-500/10 text-purple-500', icon: <Loader2 className="h-4 w-4 animate-spin" /> },
    deployed: { label: 'Ativo', color: 'bg-emerald-500/10 text-emerald-500', icon: <CheckCircle className="h-4 w-4" /> },
    cancelled: { label: 'Cancelado', color: 'bg-red-500/10 text-red-500', icon: <AlertCircle className="h-4 w-4" /> },
    refunded: { label: 'Reembolsado', color: 'bg-gray-500/10 text-gray-500', icon: <AlertCircle className="h-4 w-4" /> },
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="animate-in space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Meus Bots</h1>
        <p className="text-muted-foreground mt-1">
          Gerencie seus bots comprados e ativações
        </p>
      </div>

      {orders.length === 0 ? (
        <Card className="glass flex flex-col items-center justify-center py-16">
          <ShoppingBag className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">Nenhum bot encontrado</h3>
          <p className="text-sm text-muted-foreground mt-1 mb-6">
            Você ainda não comprou nenhum bot. Explore nossos produtos!
          </p>
          <Link href="/produtos">
            <Button>
              <ArrowRight className="mr-2 h-4 w-4" />
              Ver produtos
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {orders.map((order) => {
            const status = statusConfig[order.status] || statusConfig.pending

            return (
              <Card key={order.id} className="glass">
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <Package className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium truncate">
                          {order.bot_name || order.bot_slug}
                        </p>
                        {status.icon}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {order.duration_label}
                        {order.whitelabel && ' (Whitelabel)'}
                        {order.ticket_enabled && ' + Ticket'}
                      </p>
                      <p className="text-xs font-medium mt-1">
                        R$ {order.total_price.toFixed(2).replace('.', ',')}
                      </p>

                      <div className="mt-3">
                        <Badge variant="secondary" className={cn('text-xs', status.color)}>
                          {status.label}
                        </Badge>
                      </div>

                      {order.status === 'paid' && (
                        <div className="mt-3 space-y-2">
                          <p className="text-xs text-muted-foreground">
                            Ative seu bot no Discord usando o link abaixo:
                          </p>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1"
                              onClick={() => copyActivationLink(order.id)}
                            >
                              {copiedId === order.id ? (
                                <CheckCheck className="mr-1 h-3 w-3" />
                              ) : (
                                <Copy className="mr-1 h-3 w-3" />
                              )}
                              {copiedId === order.id ? 'Copiado!' : 'Copiar link'}
                            </Button>
                          </div>
                        </div>
                      )}

                      {order.status === 'deployed' && (
                        <div className="mt-3">
                          <Badge variant="outline" className="text-xs">
                            <CheckCircle className="mr-1 h-3 w-3" />
                            Bot ativo
                          </Badge>
                        </div>
                      )}

                      {(order.status === 'awaiting_payment' || order.status === 'pending') && (
                        <div className="mt-3">
                          <Link href={`/produtos/${order.bot_slug}`}>
                            <Button variant="outline" size="sm" className="w-full">
                              <Clock className="mr-1 h-3 w-3" />
                              Ver status do pagamento
                            </Button>
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
