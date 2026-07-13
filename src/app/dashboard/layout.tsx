import { getAuthSession } from "@/lib/session"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Sidebar } from "./_components/sidebar"
import { UserInfo } from "./_components/user-info"

export const dynamic = 'force-dynamic'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = (await getAuthSession()) as {
    user: {
      name?: string | null
      email?: string | null
      image?: string | null
      discordId?: string | null
    }
  } | null

  if (!session) {
    redirect("/login")
  }

  const supabase = createClient()
  const discordId = session.user.discordId

  let userPlan = "free"

  if (discordId) {
    const { data: user } = await supabase
      .schema("store")
      .from("users")
      .select("id")
      .eq("discord_id", discordId)
      .maybeSingle()

    if (user) {
      const { data: sub } = await supabase
        .schema("store")
        .from("subscriptions")
        .select("plans(slug)")
        .eq("user_id", user.id)
        .eq("status", "active")
        .maybeSingle()

      const planSlug = (sub as any)?.plans?.slug
      if (planSlug) userPlan = planSlug
    }
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar userPlan={userPlan} />
      <main className="flex-1 overflow-y-auto">
        <div className="flex items-center justify-end p-4 border-b border-border">
          <UserInfo
            name={session.user.name || "Usuário"}
            email={session.user.email || ""}
            image={session.user.image}
            plan={userPlan}
          />
        </div>
        <div className="p-6">{children}</div>
      </main>
    </div>
  )
}
