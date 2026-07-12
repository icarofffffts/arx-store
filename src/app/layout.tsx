import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

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
        <div className="flex min-h-screen flex-col">
          <main className="flex-1">{children}</main>
        </div>
      </body>
    </html>
  )
}
