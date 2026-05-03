import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE, getSessionCookieValue } from "@/lib/session-config";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Login sayfası ve statik dosyalar serbest
  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon")
  ) {
    return NextResponse.next();
  }

  const session = request.cookies.get(SESSION_COOKIE)?.value;

  if (session !== getSessionCookieValue()) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
