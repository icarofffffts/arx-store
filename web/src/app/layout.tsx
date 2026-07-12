import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ClientSessionProvider } from '@/components/providers/client-session-provider'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { Toaster } from '@/components/ui/toaster'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })

export const metadata: Metadata = {
  title: 'ARX Store — Bots Discord',
  description:
    'Plataforma de bots Discord com hospedagem, gestão de servidores e planos para sua comunidade. Gerencie seus bots, servidores e faturas em um só lugar.',
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
