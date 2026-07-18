import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import crypto from "crypto";

function verifyMercadoPagoSignature(
  rawBody: string,
  signature: string | null,
  secret: string
): boolean {
  if (!signature) return false;
  const parts = Object.fromEntries(
    signature.split(",").map((p) => {
      const [k, v] = p.split("=");
      return [k.trim(), v.trim()];
    })
  );
  const ts = parts["t"] || "";
  const v1 = parts["v1"] || "";
  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${ts}.${rawBody}`)
    .digest("hex");
  return (
    ts.length > 0 &&
    v1.length > 0 &&
    crypto.timingSafeEqual(Buffer.from(v1), Buffer.from(expected))
  );
}

export async function POST(request: Request) {
  try {
    const signature = request.headers.get("x-signature");
    const rawBody = await request.text();

    const webhookSecret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
    if (webhookSecret && !verifyMercadoPagoSignature(rawBody, signature, webhookSecret)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    let parsedPayload: Record<string, unknown>;
    try {
      parsedPayload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { data: webhookLog } = await supabase
      .schema("store")
      .from("webhook_logs")
      .insert({
        source: "mercadopago",
        event_type:
          (parsedPayload.action as string) ||
          (parsedPayload.type as string) ||
          "unknown",
        payload: parsedPayload,
        processed: false,
      })
      .select()
      .single();

    if (!webhookLog) throw new Error("Failed to create webhook log");

    try {
      const action = (parsedPayload.action as string) || (parsedPayload.type as string);
      const data = (parsedPayload.data || {}) as Record<string, unknown>;

      switch (action) {
        case "subscription_preapproval.authorized":
        case "subscription_authorized": {
          const preapprovalId = data.id || data.preapproval_id;
          if (preapprovalId && typeof preapprovalId === "string") {
            await supabase
              .schema("store")
              .from("subscriptions")
              .update({ status: "active" })
              .eq("mp_preapproval_id", preapprovalId);
          }
          break;
        }
        case "subscription_preapproval.cancelled":
        case "subscription_cancelled": {
          const preapprovalId = data.id || data.preapproval_id;
          if (preapprovalId && typeof preapprovalId === "string") {
            await supabase
              .schema("store")
              .from("subscriptions")
              .update({ status: "cancelled", cancelled_at: new Date().toISOString() })
              .eq("mp_preapproval_id", preapprovalId);
          }
          break;
        }
        case "subscription_preapproval.paused":
        case "subscription_paused": {
          const preapprovalId = data.id || data.preapproval_id;
          if (preapprovalId && typeof preapprovalId === "string") {
            await supabase
              .schema("store")
              .from("subscriptions")
              .update({ status: "paused" })
              .eq("mp_preapproval_id", preapprovalId);
          }
          break;
        }
        case "payment.updated":
        case "payment": {
          const paymentId = data.id;
          if (paymentId && typeof paymentId === "string") {
            const status = typeof data.status === "string" ? data.status : "approved";
            await supabase
              .schema("store")
              .from("invoices")
              .update({
                status,
                paid_at: status === "approved" ? new Date().toISOString() : null,
              })
              .eq("mp_payment_id", paymentId);
          }
          break;
        }
        default:
          break;
      }

      await supabase
        .schema("store")
        .from("webhook_logs")
        .update({ processed: true })
        .eq("id", webhookLog.id);
    } catch (err: unknown) {
      await supabase
        .schema("store")
        .from("webhook_logs")
        .update({
          processed: false,
          error: err instanceof Error ? err.message : "Unknown error",
        })
        .eq("id", webhookLog.id);
    }

    return NextResponse.json({ received: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Webhook processing failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
