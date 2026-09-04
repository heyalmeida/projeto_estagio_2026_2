import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

/**
 * Edge middleware: protect /admin and its sub-routes. Uses the slim
 * Edge-safe config from `auth.config.ts` so bcrypt and Prisma never
 * touch the Edge runtime.
 */
const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = Boolean(req.auth);
  const isAdminRoute = nextUrl.pathname.startsWith("/admin");

  if (isAdminRoute && !isLoggedIn) {
    const loginUrl = new URL("/login", nextUrl);
    loginUrl.searchParams.set("callbackUrl", nextUrl.pathname + nextUrl.search);
    return Response.redirect(loginUrl);
  }

  // Pass through everything else (the `authorized` callback above is
  // duplicated here for clarity; it is what NextAuth actually uses).
  return undefined;
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.svg$).*)"],
};