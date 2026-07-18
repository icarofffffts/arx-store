import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/session";
import { createAdminClient } from "@/lib/supabase/server";

async function resolveUser(
  supabase: ReturnType<typeof createAdminClient>,
  openId?: string | null,
  discordId?: string | null
) {
  if (openId) {
    return supabase.schema("store").from("users").select("id").eq("open_id", openId).maybeSingle();
  }
  if (discordId) {
    return supabase.schema("store").from("users").select("id").eq("discord_id", discordId).maybeSingle();
  }
  return { data: null };
}

const STATUS_LABELS: Record<string, string> = {
  pending: "Aguardando pagamento",
  awaiting_payment: "Aguardando pagamento",
  paid: "Pago",
  deploying: "Em deploy",
  deployed: "Deployado",
  cancelled: "Cancelado",
  refunded: "Reembolsado",
};

export async function GET() {
  const session = await getAuthSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { openId, discordId } = session.user as { openId?: string | null; discordId?: string | null };
  const supabase = createAdminClient();
  const { data: user } = await resolveUser(supabase, openId, discordId);

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
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }

  const enriched = (orders ?? []).map((order: any) => {
    const meta = typeof order.metadata === "string" ? JSON.parse(order.metadata) : (order.metadata ?? {});
    return {
      id: order.id,
      bot_slug: order.bot_slug,
      source_slug: meta.source_slug ?? order.bot_slug,
      status: order.status,
      status_label: STATUS_LABELS[order.status] ?? order.status,
      total_price: meta.total_price ?? 0,
      duration_label: meta.duration_label ?? "",
      whitelabel: meta.whitelabel ?? false,
      ticket_enabled: meta.ticket_enabled ?? false,
      bot_name: meta.bot_name ?? "",
      created_at: order.created_at,
      paid_at: order.paid_at ?? null,
      deployed_at: order.deployed_at ?? null,
    };
  });

  return NextResponse.json({ orders: enriched });
}