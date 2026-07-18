import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

if (!process.env.ARX_JWT_SECRET) {
  if (process.env.NODE_ENV === "development") {
    throw new Error("ARX_JWT_SECRET environment variable is not set");
  }
}
const ARX_JWT_SECRET = new TextEncoder().encode(process.env.ARX_JWT_SECRET);

const protectedPaths = ["/dashboard"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtected = protectedPaths.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );

  if (!isProtected) return NextResponse.next();

  if (
    pathname === "/login" ||
    pathname.startsWith("/api/auth/")
  ) {
    return NextResponse.next();
  }

  // ARX JWT (prioridade)
  const arxToken = request.cookies.get("arx_token")?.value;
  if (arxToken) {
    try {
      await jwtVerify(arxToken, ARX_JWT_SECRET);
      return NextResponse.next();
    } catch {
      const response = NextResponse.redirect(new URL("/login", request.url));
      response.headers.set(
        "Set-Cookie",
        "arx_token=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0"
      );
      return response;
    }
  }

  // NextAuth (Discord) session
  const nextAuthToken =
    request.cookies.get("next-auth.session-token")?.value ||
    request.cookies.get("__Secure-next-auth.session-token")?.value;
  if (nextAuthToken) {
    return NextResponse.next();
  }

  return NextResponse.redirect(new URL("/login", request.url));
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
