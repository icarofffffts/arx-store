'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X, User, CreditCard, LogOut, ShoppingBag } from 'lucide-react'
import { useAuth } from '@/components/providers/auth-context'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'

const NAV_LINKS = [
  { href: '/dashboard', label: 'Dashboard', auth: true },
  { href: '/dashboard/planos', label: 'Planos', auth: true },
  { href: '/dashboard/servidores', label: 'Servidores', auth: true },
]

function getInitials(name?: string | null): string {
  if (!name) return '?'
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
}

export function Navbar() {
  const { user, isAuthenticated, status, logout } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg tracking-tight">
          <ShoppingBag className="h-6 w-6 text-[#5865F2]" />
          <span className="hidden sm:inline">ARX Store</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => {
            if (link.auth && !isAuthenticated) return null
            return (
              <Button key={link.href} variant="ghost" size="sm" asChild>
                <Link href={link.href}>{link.label}</Link>
              </Button>
            )
          })}
        </nav>

        <div className="hidden md:flex items-center gap-2">
          {status === 'loading' ? (
            <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
          ) : isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2 px-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.image ?? undefined} alt={user.name ?? ''} />
                    <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm">{user.name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/settings" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    Meu Perfil
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/faturamento" className="cursor-pointer">
                    <CreditCard className="mr-2 h-4 w-4" />
                    Faturamento
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive cursor-pointer"
                  onClick={() => logout()}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button size="sm" asChild className="bg-[#5865F2] hover:bg-[#4752C4]">
              <Link href="/login">Entrar</Link>
            </Button>
          )}
        </div>

        <button
          className="md:hidden inline-flex items-center justify-center rounded-md p-2 hover:bg-accent"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t bg-background/95 backdrop-blur">
          <nav className="flex flex-col p-4 gap-1">
            {NAV_LINKS.map((link) => {
              if (link.auth && !isAuthenticated) return null
              return (
                <Button
                  key={link.href}
                  variant="ghost"
                  className="justify-start"
                  asChild
                  onClick={() => setMobileOpen(false)}
                >
                  <Link href={link.href}>{link.label}</Link>
                </Button>
              )
            })}
            <div className="h-px bg-border my-2" />
            {isAuthenticated && user ? (
              <>
                <div className="flex items-center gap-2 px-2 py-1">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.image ?? undefined} alt={user.name ?? ''} />
                    <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm">{user.name}</span>
                </div>
                <Button variant="ghost" className="justify-start" asChild onClick={() => setMobileOpen(false)}>
                  <Link href="/dashboard/settings"><User className="mr-2 h-4 w-4" />Meu Perfil</Link>
                </Button>
                <Button variant="ghost" className="justify-start" asChild onClick={() => setMobileOpen(false)}>
                  <Link href="/dashboard/faturamento"><CreditCard className="mr-2 h-4 w-4" />Faturamento</Link>
                </Button>
                <Button
                  variant="ghost"
                  className="justify-start text-destructive"
                  onClick={() => { setMobileOpen(false); logout() }}
                >
                  <LogOut className="mr-2 h-4 w-4" />Sair
                </Button>
              </>
            ) : (
              <Button className="bg-[#5865F2] hover:bg-[#4752C4]" asChild onClick={() => setMobileOpen(false)}>
                <Link href="/login">Entrar</Link>
              </Button>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}
