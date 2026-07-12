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

  const userId = session.user.discordId || session.user.email
  const planQuery = userId
    ? await supabase
        .schema("arx_store")
        .from("platform_users")
        .select("plan")
        .eq("discord_id", userId as string)
        .maybeSingle()
    : null

  const userPlan = planQuery?.data?.plan || "free"
  const planQuery2 = !planQuery?.data && session.user.email
    ? await supabase
        .schema("arx_store")
        .from("platform_users")
        .select("plan")
        .eq("email", session.user.email)
        .maybeSingle()
    : null

  const finalPlan = planQuery?.data?.plan || planQuery2?.data?.plan || "free"

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar userPlan={finalPlan} />
      <main className="flex-1 overflow-y-auto">
        <div className="flex items-center justify-end p-4 border-b border-border">
          <UserInfo
            name={session.user.name || "Usuário"}
            email={session.user.email || ""}
            image={session.user.image}
            plan={finalPlan}
          />
        </div>
        <div className="p-6">{children}</div>
      </main>
    </div>
  )
}
