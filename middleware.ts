import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";
import { createServerClient } from "@supabase/ssr";

const intlMiddleware = createMiddleware(routing);

const protectedAppPaths = ["/app"];
const adminPaths = ["/admin"];
const authPaths = ["/auth"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Strip locale prefix for path checks
  const localeRegex = /^\/(ar|fr|en)(\/.*)?$/;
  const localMatch = pathname.match(localeRegex);
  const localePath = localMatch ? localMatch[2] ?? "/" : pathname;

  const isProtectedApp = protectedAppPaths.some((p) => localePath.startsWith(p));
  const isAdminPath = adminPaths.some((p) => localePath.startsWith(p));
  const isAuthPath = authPaths.some((p) => localePath.startsWith(p));
  const locale = localMatch ? localMatch[1] : routing.defaultLocale;

  if (isProtectedApp || isAdminPath) {
    // Validate session
    const supabaseResponse = intlMiddleware(request);

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            );
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      const loginUrl = new URL(`/${locale}/auth/login`, request.url);
      loginUrl.searchParams.set("redirectTo", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Fetch user profile to check status and role
    const { data: profile } = await supabase
      .from("users")
      .select("status, role")
      .eq("id", user.id)
      .single();

    if (isAdminPath) {
      if (!profile || profile.role !== "admin") {
        return NextResponse.redirect(new URL(`/${locale}/app/matches`, request.url));
      }
      return supabaseResponse;
    }

    if (isProtectedApp) {
      if (!profile || profile.status === "pending") {
        return NextResponse.redirect(new URL(`/${locale}/auth/pending`, request.url));
      }
      if (profile.status === "inactive") {
        return NextResponse.redirect(new URL(`/${locale}/auth/inactive`, request.url));
      }
      return supabaseResponse;
    }
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: [
    // Match all paths except static files, api routes, and Next.js internals
    "/((?!_next/static|_next/image|favicon.ico|icons/|api/).*)",
  ],
};
