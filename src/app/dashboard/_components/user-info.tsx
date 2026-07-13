"use client"

"use client"

import { useAuth } from "@/components/providers/auth-context"
import { formatPlanLabel } from "@/lib/utils"
import { LogOut } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface UserInfoProps {
  name: string
  email: string
  image?: string | null
  plan: string
}

export function UserInfo({ name, email, image, plan }: UserInfoProps) {
  const { logout } = useAuth()
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <Avatar className="h-8 w-8">
          <AvatarImage src={image || undefined} alt={name} />
          <AvatarFallback className="bg-red-600 text-xs text-white">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="hidden sm:block">
          <p className="text-sm font-medium leading-none">{name}</p>
          <p className="text-xs text-muted-foreground">{email}</p>
        </div>
        <Badge variant="outline" className="ml-1 text-xs">
          {formatPlanLabel(plan)}
        </Badge>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => logout()}
        className="text-muted-foreground hover:text-foreground"
      >
        <LogOut className="h-4 w-4" />
      </Button>
    </div>
  )
}
