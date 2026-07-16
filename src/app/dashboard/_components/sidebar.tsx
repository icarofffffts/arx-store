"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Server,
  Crown,
  Receipt,
  Settings,
  Bot,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { formatPlanLabel } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

import Image from "next/image"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/servidores", label: "Servidores", icon: Server },
  { href: "/dashboard/planos", label: "Planos", icon: Crown },
  { href: "/dashboard/faturamento", label: "Faturamento", icon: Receipt },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
]

interface SidebarProps {
  userPlan: string
}

export function Sidebar({ userPlan }: SidebarProps) {
  const pathname = usePathname()
  const planLabel = formatPlanLabel(userPlan)

  return (
    <aside className="flex w-64 flex-col border-r border-outline-variant bg-surface-container-lowest">
      <div className="flex h-16 items-center gap-2 px-6 border-b border-outline-variant">
        <div className="flex items-center justify-center">
          <Image 
            src="/arx-logo.png" 
            alt="ARX Logo" 
            width={32} 
            height={32} 
            className="object-contain drop-shadow-[0_0_8px_rgba(225,29,72,0.4)]"
            priority
          />
        </div>
        <span className="text-lg font-heading font-medium tracking-tight text-on-surface">
          <span className="text-primary font-bold">ARX</span> Store
        </span>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded px-3 py-2 text-[14px] font-medium transition-all group",
                isActive
                  ? "bg-surface-container-high text-primary border border-outline-variant/50"
                  : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface border border-transparent"
              )}
            >
              <item.icon className={cn(
                "h-4 w-4 transition-colors", 
                isActive ? "text-primary" : "text-on-surface-variant group-hover:text-on-surface"
              )} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-outline-variant">
        <div className="flex items-center gap-3 rounded bg-surface-container-low px-3 py-3 border border-outline-variant/50">
          <Avatar className="h-8 w-8 rounded">
            <AvatarFallback className="bg-primary/20 text-xs text-primary font-medium rounded">
              AR
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 truncate">
            <p className="truncate text-[13px] font-medium text-on-surface">ARX Store</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              <p className="text-[11px] font-medium text-on-surface-variant tracking-wider uppercase">{planLabel}</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}
