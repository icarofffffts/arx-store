import type { Metadata } from 'next'
import dynamic from 'next/dynamic'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })

const SessionProvider = dynamic(
  () => import('@/components/providers/session-provider').then(m => ({ default: m.SessionProvider })),
  { ssr: false }
)

const Navbar = dynamic(
  () => import('@/components/layout/navbar').then(m => ({ default: m.Navbar })),
  { ssr: false }
)

import { Footer } from '@/components/layout/footer'

export const metadata: Metadata = {
  title: 'ARX Store — Bots Discord',
  description:
    'Plataforma de bots Discord com hospedagem, gestao de servidores e planos para sua comunidade.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning className="dark">
      <body className={`${inter.variable} font-sans bg-black text-white antialiased`}>
        <SessionProvider>
          <Navbar />
          <main className="min-h-screen">{children}</main>
          <Footer />
        </SessionProvider>
      </body>
    </html>
  )
}
