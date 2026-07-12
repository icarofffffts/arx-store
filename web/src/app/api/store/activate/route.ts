import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/session";
import { createAdminClient } from "@/lib/supabase/server";

async function resolveUser(
  supabase: ReturnType<typeof createAdminClient>,
  openId?: string | null,
  discordId?: string | null
) {
  if (openId) {
    return supabase
      .schema("store")
      .from("users")
      .select("id, discord_id")
      .eq("open_id", openId)
      .maybeSingle();
  }
  if (discordId) {
    return supabase
      .schema("store")
      .from("users")
      .select("id, discord_id")
      .eq("discord_id", discordId)
      .maybeSingle();
  }
  return { data: null, error: null };
}

export async function POST(request: Request) {
  const session = await getAuthSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { guild_id, bot_slug, config } = body;

    if (!guild_id || !bot_slug) {
      return NextResponse.json(
        { error: "Missing guild_id or bot_slug" },
        { status: 400 }
      );
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

    const { data: subscription } = await supabase
      .schema("store")
      .from("subscriptions")
      .select("*, plan:plan_id(*)")
      .eq("user_id", user.id)
      .eq("status", "active")
      .maybeSingle();

    if (!subscription) {
      return NextResponse.json(
        { error: "No active subscription" },
        { status: 403 }
      );
    }

    const plan = subscription.plan as Record<string, unknown> | null;
    if (!plan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 500 });
    }

    const { count: guildCount } = await supabase
      .schema("store")
      .from("guilds")
      .select("*", { count: "exact", head: true })
      .eq("owner_user_id", user.id);

    if ((guildCount ?? 0) >= (plan.max_guilds as number)) {
      return NextResponse.json(
        { error: "Maximum guild limit reached for your plan" },
        { status: 403 }
      );
    }

    const { count: botCount } = await supabase
      .schema("store")
      .from("guild_bots")
      .select("*", { count: "exact", head: true })
      .eq("subscription_id", subscription.id)
      .eq("status", "active");

    if ((botCount ?? 0) >= (plan.bot_limit as number)) {
      return NextResponse.json(
        { error: "Maximum bot limit reached for your plan" },
        { status: 403 }
      );
    }

    const features = plan.features as Array<{ slug: string }> | null;
    if (features && !features.find((f) => f.slug === bot_slug)) {
      return NextResponse.json(
        { error: "Bot not available in your plan" },
        { status: 403 }
      );
    }

    const { data: guild } = await supabase
      .schema("store")
      .from("guilds")
      .select("id")
      .eq("guild_id", guild_id)
      .eq("owner_user_id", user.id)
      .maybeSingle();

    if (!guild) {
      return NextResponse.json({ error: "Guild not found" }, { status: 404 });
    }

    const { data: existingBot } = await supabase
      .schema("store")
      .from("guild_bots")
      .select("id")
      .eq("guild_id", guild.id)
      .eq("bot_slug", bot_slug)
      .eq("status", "active")
      .maybeSingle();

    if (existingBot) {
      return NextResponse.json(
        { error: "Bot already active on this guild" },
        { status: 409 }
      );
    }

    const { data: guildBot, error: insertError } = await supabase
      .schema("store")
      .from("guild_bots")
      .insert({
        guild_id: guild.id,
        subscription_id: subscription.id,
        bot_slug,
        config: config || {},
        status: "active",
      })
      .select()
      .single();

    if (insertError) {
      if (insertError.code === "23505") {
        const { data: reactivated } = await supabase
          .schema("store")
          .from("guild_bots")
          .update({
            status: "active",
            config: config || {},
            subscription_id: subscription.id,
            updated_at: new Date().toISOString(),
          })
          .eq("guild_id", guild.id)
          .eq("bot_slug", bot_slug)
          .select()
          .single();

        await supabase
          .schema("store")
          .from("activation_history")
          .insert({
            guild_bot_id: reactivated.id,
            guild_id: guild.id,
            subscription_id: subscription.id,
            user_id: user.id,
            bot_slug,
            action: "activate",
          });

        return NextResponse.json({ success: true, bot_id: reactivated.id });
      }
      throw insertError;
    }

    await supabase
      .schema("store")
      .from("activation_history")
      .insert({
        guild_bot_id: guildBot.id,
        guild_id: guild.id,
        subscription_id: subscription.id,
        user_id: user.id,
        bot_slug,
        action: "activate",
      });

    return NextResponse.json({ success: true, bot_id: guildBot.id }, { status: 201 });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to activate bot";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
