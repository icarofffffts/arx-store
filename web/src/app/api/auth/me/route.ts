import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";

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

  let userQuery = supabase.schema("store").from("users").select("*");
  if (openId) {
    userQuery = userQuery.eq("open_id", openId);
  } else if (discordId) {
    userQuery = userQuery.eq("discord_id", discordId);
  } else {
    return NextResponse.json({ error: "User identifier not found" }, { status: 401 });
  }

  const { data: user, error: userError } = await userQuery.maybeSingle();
  if (userError || !user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const { data: subscription } = await supabase
    .schema("store")
    .from("subscriptions")
    .select("*, plan:plan_id(*)")
    .eq("user_id", user.id)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return NextResponse.json({
    id: user.id,
    name: user.name,
    email: user.email,
    image: user.avatar_url,
    discordId: user.discord_id,
    plan: subscription?.plan?.slug ?? null,
    subscription: subscription ?? null,
  });
}
