import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { getAuthSession } from "@/lib/session";

export const dynamic = 'force-dynamic';

// POST - Create lead (public, no auth required)
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, discord_server, discord_id, bot_interest, server_size, message, source, utm_campaign } = body;

    if (!name || !bot_interest) {
      return NextResponse.json({ error: "Name and bot interest are required" }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { data: lead, error } = await supabase
      .schema("store")
      .from("leads")
      .insert({
        name,
        email: email || null,
        discord_server: discord_server || null,
        discord_id: discord_id || null,
        bot_interest,
        server_size: server_size || null,
        message: message || null,
        source: source || "website",
        utm_campaign: utm_campaign || null,
      })
      .select()
      .single();

    if (error) {
      console.error("Lead creation error:", error);
      return NextResponse.json({ error: "Failed to create lead" }, { status: 500 });
    }

    return NextResponse.json({ success: true, lead });
  } catch (err: any) {
    console.error("Lead API error:", err);
    return NextResponse.json({ error: err.message || "Internal error" }, { status: 500 });
  }
}

// GET - List leads (authenticated only)
export async function GET() {
  try {
    const session = await getAuthSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createAdminClient();

    const { data: leads, error } = await supabase
      .schema("store")
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Lead fetch error:", error);
      return NextResponse.json({ error: "Failed to fetch leads" }, { status: 500 });
    }

    return NextResponse.json({ leads: leads || [] });
  } catch (err: any) {
    console.error("Lead API error:", err);
    return NextResponse.json({ error: err.message || "Internal error" }, { status: 500 });
  }
}
