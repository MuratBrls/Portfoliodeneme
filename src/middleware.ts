import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Protect admin routes (except login page)
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const authCookie = request.cookies.get("admin-auth");
    
    // If no auth cookie, redirect to login
    if (!authCookie || authCookie.value !== "authenticated") {
      const loginUrl = new URL("/admin/login", request.url);
      // Add redirect parameter so we can return user after login
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }
  
  // If user is on login page and already authenticated, redirect to admin
  if (pathname === "/admin/login") {
    const authCookie = request.cookies.get("admin-auth");
    if (authCookie && authCookie.value === "authenticated") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};

