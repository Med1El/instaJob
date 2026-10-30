import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";
import { createServerClient } from "@supabase/ssr";

const intlMiddleware = createMiddleware(routing);

const protectedAppPaths = ["/app"];
const adminPaths = ["/admin"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Strip locale prefix to get the bare path
  const localeRegex = /^\/(ar|fr|en)(\/.*)?$/;
  const localMatch = pathname.match(localeRegex);
  const localePath = localMatch ? (localMatch[2] ?? "/") : pathname;
  const locale = localMatch ? localMatch[1] : routing.defaultLocale;

  const isProtectedApp = protectedAppPaths.some((p) => localePath.startsWith(p));
  const isAdminPath = adminPaths.some((p) => localePath.startsWith(p));

  if (isProtectedApp || isAdminPath) {
    // Build a response first so we can forward cookies
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

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      const loginUrl = new URL(`/${locale}/auth/login`, request.url);
      loginUrl.searchParams.set("redirectTo", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Check user_role / status (column renamed from 'role' to avoid PostgREST JWT conflict)
    const { data: profile } = await supabase
      .from("users")
      .select("status, user_role")
      .eq("id", user.id)
      .single();

    const typedProfile = profile as { user_role: string; status: string } | null;

    if (isAdminPath) {
      if (!typedProfile || typedProfile.user_role !== "admin") {
        return NextResponse.redirect(
          new URL(`/${locale}/auth/login`, request.url)
        );
      }
      return supabaseResponse;
    }

    if (isProtectedApp) {
      if (!typedProfile || typedProfile.status === "pending") {
        return NextResponse.redirect(
          new URL(`/${locale}/auth/pending`, request.url)
        );
      }
      if (typedProfile.status === "inactive") {
        return NextResponse.redirect(
          new URL(`/${locale}/auth/inactive`, request.url)
        );
      }
      return supabaseResponse;
    }
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: [
    // Skip Next.js internals, static files, api routes, and PWA assets
    "/((?!_next/static|_next/image|favicon.ico|icons/|manifest.json|sw.js|api/).*)",
  ],
};
