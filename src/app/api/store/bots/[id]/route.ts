import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/session";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { validateId, sanitizeConfig } from "@/lib/validation";

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

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getAuthSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const botId = validateId(params.id, 'uuid');
  if (!botId) {
    return NextResponse.json({ error: "Invalid bot ID format" }, { status: 400 });
  }

  const supabase = createClient();

  const { data: guildBot, error } = await supabase
    .schema("store")
    .from("guild_bots")
    .select("*, guild:guild_id(*)")
    .eq("id", params.id)
    .maybeSingle();

  if (error || !guildBot) {
    return NextResponse.json({ error: "Bot not found" }, { status: 404 });
  }

  return NextResponse.json(guildBot);
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getAuthSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const botId = validateId(params.id, 'uuid');
  if (!botId) {
    return NextResponse.json({ error: "Invalid bot ID format" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { config } = body;

    if (!config) {
      return NextResponse.json({ error: "Missing config" }, { status: 400 });
    }

    const safeConfig = sanitizeConfig(config);
    if (safeConfig === null) {
      return NextResponse.json({ error: "Invalid config format" }, { status: 400 });
    }

    const { openId, discordId } = session.user as {
      openId?: string | null;
      discordId?: string | null;
    };

    const supabase = createAdminClient();
    const { data: user } = await resolveUser(supabase, openId, discordId);

    const { data: guildBot } = await supabase
      .schema("store")
      .from("guild_bots")
      .select("id, guild:guild_id(owner_user_id)")
      .eq("id", botId)
      .maybeSingle();

    if (!guildBot) {
      return NextResponse.json({ error: "Bot not found" }, { status: 404 });
    }

    const guildOwner = (
      guildBot.guild as unknown as Record<string, unknown>
    )?.owner_user_id;

    if (user?.id !== guildOwner) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { data: updated, error } = await supabase
      .schema("store")
      .from("guild_bots")
      .update({ config: safeConfig })
      .eq("id", botId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(updated);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to update bot";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getAuthSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const botId = validateId(params.id, 'uuid');
  if (!botId) {
    return NextResponse.json({ error: "Invalid bot ID format" }, { status: 400 });
  }

  try {
    const { openId, discordId } = session.user as {
      openId?: string | null;
      discordId?: string | null;
    };

    const supabase = createAdminClient();
    const { data: user } = await resolveUser(supabase, openId, discordId);

    const { data: guildBot } = await supabase
      .schema("store")
      .from("guild_bots")
      .select("id, bot_slug, guild_id, subscription_id, guild:guild_id(owner_user_id)")
      .eq("id", botId)
      .maybeSingle();

    if (!guildBot) {
      return NextResponse.json({ error: "Bot not found" }, { status: 404 });
    }

    const guildOwner = (
      guildBot.guild as unknown as Record<string, unknown>
    )?.owner_user_id;

    if (user?.id !== guildOwner) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await supabase
      .schema("store")
      .from("guild_bots")
      .update({ status: "inactive" })
      .eq("id", botId);

    await supabase
      .schema("store")
      .from("activation_history")
      .insert({
        guild_bot_id: guildBot.id,
        guild_id: guildBot.guild_id,
        subscription_id: guildBot.subscription_id,
        user_id: user?.id,
        bot_slug: guildBot.bot_slug,
        action: "deactivate",
      });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to deactivate bot";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
