import { getAuthSession } from "@/lib/session"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Sidebar } from "./_components/sidebar"
import { MobileNav } from "./_components/mobile-nav"
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
    <div className="flex h-screen bg-background overflow-hidden selection:bg-primary/30">
      <Sidebar userPlan={userPlan} />
      <MobileNav
        userPlan={userPlan}
        userImage={session.user.image}
        userName={session.user.name || "Usuário"}
      />
      <main className="flex-1 flex flex-col min-w-0 bg-surface">
        <header className="flex h-16 shrink-0 items-center justify-end px-4 sm:px-8 border-b border-outline-variant bg-surface-container-lowest/50 backdrop-blur-md sticky top-0 z-10 w-full">
          <div className="lg:hidden w-10" />
          <UserInfo
            name={session.user.name || "Usuário"}
            email={session.user.email || ""}
            image={session.user.image}
            plan={userPlan}
          />
        </header>
        <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <div className="mx-auto max-w-6xl">
            {children}
          </div>
        </div>
      </main>
    </div>
  )
}
