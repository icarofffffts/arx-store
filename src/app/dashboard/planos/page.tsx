import { getAuthSession } from "@/lib/session"
import { createClient } from "@/lib/supabase/server"
import { PlansClient } from "./_components/plans-client"

export default async function PlansPage() {
  const session = (await getAuthSession()) as {
    user: {
      name?: string | null
      email?: string | null
      discordId?: string | null
    }
  } | null

  if (!session) return null

  const supabase = createClient()
  const discordId = session.user.discordId

  const { data: plans } = await supabase
    .schema("store")
    .from("plans")
    .select("*")
    .eq("is_active", true)
    .order("price_cents")

  let currentPlanSlug: string | null = null

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
        .select("plan:plan_id(slug)")
        .eq("user_id", user.id)
        .eq("status", "active")
        .maybeSingle()

      const planSlug = (sub as any)?.plan?.slug
      if (planSlug) currentPlanSlug = planSlug
    }
  }

  return (
    <div className="animate-in space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Planos</h1>
        <p className="text-muted-foreground mt-1">
          Escolha o plano ideal para você
        </p>
      </div>

      <PlansClient plans={plans || []} currentPlanSlug={currentPlanSlug} />
    </div>
  )
}
