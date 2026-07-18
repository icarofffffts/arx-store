import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { cacheGet, cacheSet } from "@/lib/cache";

const CACHE_KEY = "plans:active";
const CACHE_TTL = 120;

export async function GET() {
  const cached = cacheGet<unknown[]>(CACHE_KEY);
  if (cached) {
    return NextResponse.json(cached, {
      headers: { "Cache-Control": "public, s-maxage=120, stale-while-revalidate=60" },
    });
  }

  try {
    const supabase = createClient();

    const { data: plans, error } = await supabase
      .schema("store")
      .from("plans")
      .select("*")
      .eq("is_active", true)
      .order("price_cents", { ascending: true });

    if (error) throw error;

    cacheSet(CACHE_KEY, plans, CACHE_TTL);

    return NextResponse.json(plans, {
      headers: { "Cache-Control": "public, s-maxage=120, stale-while-revalidate=60" },
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch plans" },
      { status: 500 }
    );
  }
}
