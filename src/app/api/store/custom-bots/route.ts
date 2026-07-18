import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/session";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { validateId, sanitizeText } from "@/lib/validation";

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

  const { data: orders, error } = await supabase
    .schema("store")
    .from("custom_bot_orders")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json(
      { error: "Failed to fetch custom bot orders" },
      { status: 500 }
    );
  }

  return NextResponse.json(orders ?? []);
}

export async function POST(request: Request) {
  const session = await getAuthSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, description, requirements, guild_id } = body;

    const safeName = sanitizeText(name, 100);
    const safeDesc = sanitizeText(description, 1000);
    const safeReqs = requirements ? sanitizeText(requirements, 2000) : null;
    const safeGuildId = guild_id ? validateId(guild_id, 'discord') : null;

    if (!safeName || !safeDesc) {
      return NextResponse.json(
        { error: "Missing required fields: name, description" },
        { status: 400 }
      );
    }

    if (guild_id && !safeGuildId) {
      return NextResponse.json(
        { error: "Invalid guild_id format" },
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

    const { data: order, error } = await supabase
      .schema("store")
      .from("custom_bot_orders")
      .insert({
        user_id: user.id,
        name: safeName,
        description: safeDesc,
        requirements: safeReqs,
        status: "briefing",
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(order, { status: 201 });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to create custom bot order";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
