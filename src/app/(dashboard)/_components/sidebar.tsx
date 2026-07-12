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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

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

  const planLabel =
    userPlan === "enterprise"
      ? "Enterprise"
      : userPlan === "premium"
        ? "Premium"
        : "Free"

  return (
    <aside className="flex w-64 flex-col border-r border-white/[0.04] bg-[#030014]/80 backdrop-blur">
      <div className="flex h-14 items-center gap-2 px-4 border-b border-white/[0.04]">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#5865F2] to-[#7c3aed] flex items-center justify-center">
          <Bot className="h-4 w-4 text-white" />
        </div>
        <span className="text-lg font-bold tracking-tight">
          <span className="gradient-text">ARX</span> Store
        </span>
      </div>

      <nav className="flex-1 space-y-1 p-3">
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
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-[#5865F2]/10 text-[#5865F2]"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <Separator />
      <div className="p-3">
        <div className="flex items-center gap-3 rounded-md px-3 py-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-[#5865F2] text-xs text-white">
              AR
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 truncate">
            <p className="truncate text-sm font-medium">ARX Store</p>
            <Badge variant="secondary" className="mt-0.5 text-xs">
              {planLabel}
            </Badge>
          </div>
        </div>
      </div>
    </aside>
  )
}
