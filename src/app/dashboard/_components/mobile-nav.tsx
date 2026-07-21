"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import {
  LayoutDashboard,
  Server,
  ShoppingBag,
  Bot,
  Receipt,
  Settings,
  Rocket,
  BarChart3,
  Users,
  X,
  Menu,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { formatPlanLabel } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Image from "next/image"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/produtos", label: "Produtos", icon: ShoppingBag },
  { href: "/dashboard/meus-bots", label: "Meus Bots", icon: Bot },
  { href: "/dashboard/leads", label: "Leads", icon: Users },
  { href: "/dashboard/servidores", label: "Servidores", icon: Server },
  { href: "/dashboard/deployments", label: "Deployments", icon: Rocket },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/dashboard/faturamento", label: "Faturamento", icon: Receipt },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
]

interface MobileNavProps {
  userPlan: string
  userImage?: string | null
  userName?: string
}

export function MobileNav({ userPlan, userImage, userName }: MobileNavProps) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const planLabel = formatPlanLabel(userPlan)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed top-4 left-4 z-50 flex h-10 w-10 items-center justify-center rounded-lg bg-surface-container-high border border-outline-variant lg:hidden"
      >
        <Menu className="h-5 w-5 text-on-surface-variant" />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-outline-variant bg-surface-container-lowest transition-transform duration-200 lg:hidden",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between px-4 border-b border-outline-variant">
          <div className="flex items-center gap-2">
            <Image src="/arx-logo.png" alt="ARX Logo" width={28} height={28} className="object-contain drop-shadow-[0_0_8px_rgba(225,29,72,0.4)]" />
            <span className="text-base font-heading font-medium text-on-surface">
              <span className="text-primary font-bold">ARX</span> Store
            </span>
          </div>
          <button onClick={() => setOpen(false)} className="flex h-8 w-8 items-center justify-center rounded hover:bg-surface-container">
            <X className="h-4 w-4 text-on-surface-variant" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = item.href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded px-3 py-2 text-sm font-medium transition-all",
                  isActive
                    ? "bg-surface-container-high text-primary border border-outline-variant/50"
                    : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface border border-transparent"
                )}
              >
                <item.icon className={cn("h-4 w-4", isActive ? "text-primary" : "text-on-surface-variant")} />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-outline-variant">
          <div className="flex items-center gap-3 rounded bg-surface-container px-3 py-3 border border-outline-variant/50">
            <Avatar className="h-8 w-8 rounded">
              {userImage ? (
                <AvatarImage src={userImage} />
              ) : null}
              <AvatarFallback className="bg-primary/20 text-xs text-primary font-medium rounded">
                AR
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 truncate">
              <p className="truncate text-[13px] font-medium text-on-surface">{userName || "Usuário"}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                <p className="text-[11px] font-medium text-on-surface-variant tracking-wider uppercase">{planLabel}</p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}