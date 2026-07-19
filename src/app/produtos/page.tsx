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
import { BOT_PRODUCTS, PRICING_TIERS, formatPriceCents } from '@/lib/pricing'
import { Ticket, ShoppingCart, ArrowRight, Check } from 'lucide-react'

const ICON_MAP: Record<string, React.ReactNode> = {
  ticket: <Ticket className="h-8 w-8 text-primary" />,
  shopping: <ShoppingCart className="h-8 w-8 text-primary" />,
}

export default function ProductsPage() {
  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight">Nossos Bots</h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Compra unica, ativa quando quiser. Sem assinatura mensal.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto">
          {BOT_PRODUCTS.map((product) => (
            <Card key={product.slug} className="glass flex flex-col">
              <CardHeader className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
                  {ICON_MAP[product.icon]}
                </div>
                <CardTitle className="text-2xl">{product.name}</CardTitle>
                <CardDescription className="text-base mt-2">
                  {product.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="flex-1 space-y-6">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Precos:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {PRICING_TIERS.map((tier) => (
                      <div
                        key={tier.months}
                        className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2"
                      >
                        <span className="text-sm text-muted-foreground">{tier.label}</span>
                        <span className="text-sm font-semibold">{formatPriceCents(tier.priceCents)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <ul className="space-y-2">
                  {product.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                {product.allowTicketAddon && (
                  <Badge variant="secondary" className="w-full justify-center">
                    Addon Sistema de Ticket disponivel
                  </Badge>
                )}
              </CardContent>

              <CardFooter className="pt-0">
                <Link href={`/produtos/${product.slug}`} className="w-full">
                  <Button className="w-full" size="lg">
                    Comprar Agora
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground">
            Todos os bots incluem suporte tecnico via Discord.{' '}
            <Link href="/dashboard/meus-bots" className="text-primary hover:underline">
              Ver meus bots
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
