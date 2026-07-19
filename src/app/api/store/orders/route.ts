import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/session";
import { createAdminClient } from "@/lib/supabase/server";
import { calculatePrice, type DurationMonths, BOT_PRODUCTS } from "@/lib/pricing";
import { MercadoPagoConfig, Payment } from "mercadopago";

export const dynamic = 'force-dynamic';

const mpClient = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN!,
});
const paymentClient = new Payment(mpClient);

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
  return { data: null, error: null };
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
    let meta: Record<string, unknown> = {};
    if (typeof order.metadata === "string") {
      try { meta = JSON.parse(order.metadata); } catch { meta = {}; }
    } else { meta = (order.metadata ?? {}) as Record<string, unknown>; }
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

export async function POST(req: Request) {
  const session = await getAuthSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { bot_name, duration_months, whitelabel, ticket_system, total_cents } = body;

  // Validate bot
  const product = BOT_PRODUCTS.find((p) => p.slug === bot_name);
  if (!product) {
    return NextResponse.json({ error: "Invalid bot" }, { status: 400 });
  }

  // Validate price
  const { totalCents: expectedTotal } = calculatePrice(
    duration_months as DurationMonths,
    whitelabel ?? false,
    product.allowTicketAddon && (ticket_system ?? false)
  );
  if (expectedTotal !== total_cents) {
    return NextResponse.json({ error: "Price mismatch" }, { status: 400 });
  }

  const { openId, discordId } = session.user as { openId?: string | null; discordId?: string | null };
  const supabase = createAdminClient();
  const { data: user } = await resolveUser(supabase, openId, discordId);

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Create order
  const { data: order, error: orderError } = await supabase
    .schema("store")
    .from("custom_bot_orders")
    .insert({
      user_id: user.id,
      bot_slug: bot_name,
      status: "awaiting_payment",
      source: "website",
      total_price_cents: expectedTotal,
      duration_months,
      whitelabel: whitelabel ?? false,
      ticket_enabled: product.allowTicketAddon && (ticket_system ?? false),
      metadata: {
        source: "website",
        bot_name: product.name,
        duration_label: duration_months === 0 ? "Vitalício" : `${duration_months} mês${duration_months > 1 ? "es" : ""}`,
        whitelabel,
        ticket_system,
        total_price: expectedTotal / 100,
      },
    })
    .select("id")
    .single();

  if (orderError || !order) {
    console.error("Order creation error:", orderError);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }

  // Create Pix payment via MercadoPago
  try {
    const paymentData = await paymentClient.create({
      body: {
        transaction_amount: expectedTotal / 100,
        description: `${product.name} - ${duration_months === 0 ? "Vitalício" : `${duration_months} mes(es)`}`,
        payment_method_id: "pix",
        payer: {
          email: session.user.email || `user-${user.id}@arxstore.local`,
        },
        metadata: {
          order_id: order.id,
          bot_name: product.name,
          source: "website",
        },
      },
    });

    const pixData = paymentData.point_of_interaction?.transaction_data;
    if (!pixData) {
      throw new Error("No PIX data returned from MercadoPago");
    }

    // Update order with payment ID
    await supabase
      .schema("store")
      .from("custom_bot_orders")
      .update({
        metadata: {
          source: "website",
          bot_name: product.name,
          duration_label: duration_months === 0 ? "Vitalício" : `${duration_months} mês${duration_months > 1 ? "es" : ""}`,
          whitelabel,
          ticket_system,
          total_price: expectedTotal / 100,
          mp_payment_id: paymentData.id,
        },
      })
      .eq("id", order.id);

    return NextResponse.json({
      order_id: order.id,
      qr_code: pixData.qr_code_base64,
      copy_paste: pixData.qr_code,
      payment_id: paymentData.id,
    });
  } catch (err: any) {
    console.error("Pix payment error:", err);
    return NextResponse.json({ error: "Failed to create PIX payment" }, { status: 500 });
  }
}