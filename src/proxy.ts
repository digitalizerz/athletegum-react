import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { readSession, SESSION_COOKIE } from "@/lib/auth-token";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? await readSession(token) : null;
  const athleteArea = pathname.startsWith("/athlete/dashboard") || pathname.startsWith("/athlete/deals");
  const businessArea = pathname.startsWith("/dashboard");

  if ((athleteArea || businessArea) && !session) {
    const login = athleteArea ? "/athlete/login" : "/login";
    return NextResponse.redirect(new URL(login, request.url));
  }

  if (businessArea && session?.role === "athlete") {
    return NextResponse.redirect(new URL("/athlete/dashboard", request.url));
  }

  if (athleteArea && session && session.role !== "athlete") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard", "/dashboard/:path*", "/athlete/dashboard", "/athlete/deals/:path*"],
};
