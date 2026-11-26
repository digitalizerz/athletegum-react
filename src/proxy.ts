import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { readSession, SESSION_COOKIE } from "@/lib/auth-token";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? await readSession(token) : null;
  const athletePrefixes = ["/athlete/dashboard", "/athlete/opportunities", "/athlete/deals", "/athlete/profile", "/athlete/earnings", "/athlete/messages", "/athlete/notifications"];
  const athleteArea = athletePrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
  const businessArea = pathname.startsWith("/dashboard");
  const adminArea = pathname === "/admin" || pathname.startsWith("/admin/");

  if ((athleteArea || businessArea || adminArea) && !session) {
    const login = athleteArea ? "/athlete/login" : "/login";
    return NextResponse.redirect(new URL(login, request.url));
  }

  if (businessArea && session?.role === "athlete") {
    return NextResponse.redirect(new URL("/athlete/dashboard", request.url));
  }

  if (businessArea && session?.role === "admin") {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  if (athleteArea && session && session.role !== "athlete") {
    return NextResponse.redirect(new URL(session.role === "admin" ? "/admin" : "/dashboard", request.url));
  }

  if (adminArea && session && session.role !== "admin") {
    return NextResponse.redirect(new URL(session.role === "athlete" ? "/athlete/dashboard" : "/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard",
    "/dashboard/:path*",
    "/athlete/dashboard",
    "/athlete/opportunities",
    "/athlete/deals/:path*",
    "/athlete/profile",
    "/athlete/earnings",
    "/athlete/messages",
    "/athlete/notifications",
    "/admin",
    "/admin/:path*",
  ],
};
