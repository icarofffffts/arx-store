import { NextResponse } from "next/server";
import {
  exchangeCodeForToken,
  verifyArxJwt,
  buildArxSessionCookie,
} from "@/lib/arx-auth";
import { jwtVerify } from "jose";

const ARX_JWT_SECRET = new TextEncoder().encode(
  process.env.ARX_JWT_SECRET || "super_secret_arx_auth_key_2026"
);

function getSiteUrl(request: Request): string {
  const host =
    request.headers.get("x-forwarded-host") ||
    request.headers.get("host") ||
    "";
  const proto = request.headers.get("x-forwarded-proto") || "https";
  if (host) return `${proto}://${host}`;
  return process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
}

export async function GET(request: Request) {
  const siteUrl = getSiteUrl(request);
  const url = new URL(request.url, siteUrl);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  if (!code) {
    return NextResponse.redirect(
      new URL("/login?error=no_code", siteUrl)
    );
  }

  const callbackUri = `${siteUrl}/api/auth/arx-callback`;

  const token = await exchangeCodeForToken(code, callbackUri);
  if (!token) {
    return NextResponse.redirect(
      new URL("/login?error=token_exchange", siteUrl)
    );
  }

  const user = await verifyArxJwt(token).catch(() => null);
  if (!user) {
    return NextResponse.redirect(
      new URL("/login?error=invalid_token", siteUrl)
    );
  }

  try {
    const { createAdminClient } = await import("@/lib/supabase/server");
    const supabase = createAdminClient();

    const { data: existing } = await supabase
      .schema("store")
      .from("users")
      .select("id")
      .eq("open_id", user.openId)
      .maybeSingle();

    const { payload } = await jwtVerify(token, ARX_JWT_SECRET);
    const discordId = payload.discordId as string | undefined;
    const discordUsername = payload.discordUsername as string | undefined;
    const discordAvatar = payload.discordAvatar as string | null;

    const userData: Record<string, unknown> = {
      open_id: user.openId,
      email: user.email,
      name: discordUsername || user.name,
      avatar_url: discordAvatar || null,
      updated_at: new Date().toISOString(),
    };
    if (discordId) {
      userData.discord_id = discordId;
    }

    if (existing) {
      await supabase
        .schema("store")
        .from("users")
        .update(userData)
        .eq("id", existing.id);
    } else {
      await supabase.schema("store").from("users").insert(userData);
    }
  } catch {
    // non-critical: proceed with redirect even if sync fails
  }

  const response = NextResponse.redirect(
    new URL(state || "/dashboard", siteUrl)
  );

  const cookieData = buildArxSessionCookie(token, 86400);
  const [cookieName, ...rest] = cookieData.split("=");
  const cookieValue = rest.join("=");
  const attrs = cookieValue.split(";").slice(1).join(";").trim();
  response.cookies.set(cookieName, cookieValue.split(";")[0], {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 86400,
    path: "/",
  });

  return response;
}
