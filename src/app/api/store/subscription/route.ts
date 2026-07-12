import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/session";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { cancelSubscription } from "@/lib/mercadopago";

async function resolveUser(
  supabase: ReturnType<typeof createAdminClient>,
  openId?: string | null,
  discordId?: string | null
) {
  if (openId) {
    return supabase
      .schema("store")
      .from("users")
      .select("id")
      .eq("open_id", openId)
      .maybeSingle();
  }
  if (discordId) {
    return supabase
      .schema("store")
      .from("users")
      .select("id")
      .eq("discord_id", discordId)
      .maybeSingle();
  }
  return { data: null, error: null };
}

export async function GET() {
  const session = await getAuthSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { openId, discordId } = session.user as {
    openId?: string | null;
    discordId?: string | null;
  };

  const supabase = createClient();
  const { data: user } = await resolveUser(supabase as any, openId, discordId);

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const { data: subscription, error } = await supabase
    .schema("store")
    .from("subscriptions")
    .select("*, plan:plan_id(*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    return NextResponse.json(
      { error: "Failed to fetch subscription" },
      { status: 500 }
    );
  }

  return NextResponse.json({ subscription });
}

export async function POST(request: Request) {
  const session = await getAuthSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { plan_slug } = body;

    if (!plan_slug) {
      return NextResponse.json({ error: "Missing plan_slug" }, { status: 400 });
    }

    const { openId, discordId } = session.user as {
      openId?: string | null;
      discordId?: string | null;
    };

    const supabase = createAdminClient();
    const { data: user } = await resolveUser(supabase, openId, discordId);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { data: plan } = await supabase
      .schema("store")
      .from("plans")
      .select("*")
      .eq("slug", plan_slug)
      .eq("is_active", true)
      .maybeSingle();

    if (!plan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    if (plan.price_cents === 0) {
      const { data: subscription, error: insertError } = await supabase
        .schema("store")
        .from("subscriptions")
        .insert({
          user_id: user.id,
          plan_id: plan.id,
          status: "active",
          current_period_start: new Date().toISOString(),
        })
        .select()
        .single();

      if (insertError) throw insertError;

      return NextResponse.json({
        subscription_id: subscription.id,
        init_point: null,
      });
    }

    const { PreApproval } = await import("mercadopago");
    const { mpClient } = await import("@/lib/mercadopago");

    const preApproval = new PreApproval(mpClient);
    const mpResult = await preApproval.create({
      body: {
        reason: `ARX Store - ${plan.name}`,
        auto_recurring: {
          frequency: 1,
          frequency_type: "months",
          transaction_amount: plan.price_cents / 100,
          currency_id: "BRL",
        },
        back_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard`,
        payer_email: session.user.email || undefined,
      },
    });

    const { data: subscription, error: insertError } = await supabase
      .schema("store")
      .from("subscriptions")
      .insert({
        user_id: user.id,
        plan_id: plan.id,
        mp_preapproval_id: mpResult.id,
        status: "pending",
      })
      .select()
      .single();

    if (insertError) throw insertError;

    return NextResponse.json({
      init_point: mpResult.init_point,
      subscription_id: subscription.id,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to create subscription";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE() {
  const session = await getAuthSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { openId, discordId } = session.user as {
      openId?: string | null;
      discordId?: string | null;
    };

    const supabase = createAdminClient();
    const { data: user } = await resolveUser(supabase, openId, discordId);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { data: subscription } = await supabase
      .schema("store")
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "active")
      .maybeSingle();

    if (!subscription) {
      return NextResponse.json(
        { error: "No active subscription" },
        { status: 404 }
      );
    }

    if (subscription.mp_preapproval_id) {
      try {
        await cancelSubscription(subscription.mp_preapproval_id);
      } catch {
        // proceed with DB cancellation even if MP API fails
      }
    }

    await supabase
      .schema("store")
      .from("subscriptions")
      .update({
        status: "cancelled",
        cancelled_at: new Date().toISOString(),
      })
      .eq("id", subscription.id);

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to cancel subscription";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
