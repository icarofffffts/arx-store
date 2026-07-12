import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/session";
import { createClient, createAdminClient } from "@/lib/supabase/server";

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

  const { data: guilds, error } = await supabase
    .schema("store")
    .from("guilds")
    .select("*")
    .eq("owner_user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json(
      { error: "Failed to fetch guilds" },
      { status: 500 }
    );
  }

  const guildIds = (guilds ?? []).map((g) => g.id);
  const { data: botCounts } = await supabase
    .schema("store")
    .from("guild_bots")
    .select("guild_id, count")
    .in("guild_id", guildIds)
    .eq("status", "active");

  const countMap = new Map<string, number>();
  for (const row of (botCounts ?? []) as Array<{ guild_id: string }>) {
    countMap.set(row.guild_id, (countMap.get(row.guild_id) || 0) + 1);
  }

  const normalized = (guilds ?? []).map((guild) => ({
    ...guild,
    bot_count: countMap.get(guild.id) ?? 0,
  }));

  return NextResponse.json(normalized);
}

export async function POST(request: Request) {
  const session = await getAuthSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { guild_id, guild_name, guild_icon } = body;

    if (!guild_id) {
      return NextResponse.json({ error: "Missing guild_id" }, { status: 400 });
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

    const ownerDiscordId = user.discord_id || discordId;

    const { data: guild, error } = await supabase
      .schema("store")
      .from("guilds")
      .insert({
        guild_id,
        name: guild_name || "",
        icon: guild_icon || null,
        owner_discord_id: ownerDiscordId,
        owner_user_id: user.id,
      })
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "Guild already registered" },
          { status: 409 }
        );
      }
      throw error;
    }

    return NextResponse.json(guild, { status: 201 });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to register guild";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
