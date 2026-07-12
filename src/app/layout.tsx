import type { Metadata } from 'next'
import dynamic from 'next/dynamic'
import { Inter } from 'next/font/google'
import { Footer } from '@/components/layout/footer'
import { Toaster } from '@/components/ui/toaster'
import './globals.css'

const Navbar = dynamic(() => import('@/components/layout/navbar').then(mod => mod.Navbar), { ssr: false })
const ClientSessionProvider = dynamic(
  () => import('@/components/providers/client-session-provider').then(mod => mod.ClientSessionProvider),
  { ssr: false }
)

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })

export const metadata: Metadata = {
  title: 'ARX Store — Bots Discord',
  description:
    'Plataforma de bots Discord com hospedagem, gestao de servidores e planos para sua comunidade. Gerencie seus bots, servidores e faturas em um so lugar.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning className="dark">
      <body className={`${inter.variable} font-sans bg-background text-foreground antialiased`}>
        <ClientSessionProvider>
          <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
          <Toaster />
        </ClientSessionProvider>
      </body>
    </html>
  )
}
