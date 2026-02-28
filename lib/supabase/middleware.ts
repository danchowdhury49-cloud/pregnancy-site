import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow Next internals + unlock page + api routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname === "/favicon.ico" ||
    pathname === "/unlock"
  ) {
    return NextResponse.next();
  }

  const authed = req.cookies.get("ps_auth")?.value === "1";

  // If not authed, always go to unlock.
  // If they requested "/", send them to "/home" after unlock.
  if (!authed) {
    const url = req.nextUrl.clone();
    url.pathname = "/unlock";
    url.searchParams.set("next", pathname === "/" ? "/home" : pathname);
    return NextResponse.redirect(url);
  }

  // If authed and they hit "/", send them to "/home"
  if (pathname === "/") {
    const url = req.nextUrl.clone();
    url.pathname = "/home";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};