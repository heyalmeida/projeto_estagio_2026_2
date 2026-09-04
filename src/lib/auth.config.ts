import type { NextAuthConfig } from "next-auth";

/**
 * Edge-safe NextAuth config: shared between the full Node config and
 * the edge middleware. Providers that require Node APIs (like bcrypt)
 * live in `auth.ts`, NOT here.
 */
export const authConfig: NextAuthConfig = {
  trustHost: true,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  // Providers intentionally empty here — see auth.ts.
  providers: [],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = Boolean(auth?.user);
      const isAdminRoute = nextUrl.pathname.startsWith("/admin");

      if (isAdminRoute && !isLoggedIn) {
        const loginUrl = new URL("/login", nextUrl);
        loginUrl.searchParams.set("callbackUrl", nextUrl.pathname + nextUrl.search);
        return Response.redirect(loginUrl);
      }
      return true;
    },
  },
};