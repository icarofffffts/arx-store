import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = createClient();

    const { data: plans, error } = await supabase
      .schema("store")
      .from("plans")
      .select("*")
      .eq("is_active", true)
      .order("price_cents", { ascending: true });

    if (error) throw error;

    return NextResponse.json(plans);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch plans" },
      { status: 500 }
    );
  }
}
