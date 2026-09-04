import NextAuth, { type DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "./prisma";
import { authConfig } from "./auth.config";

/**
 * NextAuth v5 configuration with a Credentials Provider backed by the
 * `Admin` table. Passwords are compared using bcryptjs.
 *
 * The session is JWT-based (required by the Credentials provider) and
 * only carries the admin id/email — no sensitive data is ever sent to
 * the client.
 */

const credentialsSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1),
});

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: "E-mail", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(raw) {
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) return null;

        const admin = await prisma.admin.findUnique({
          where: { email: parsed.data.email },
        });
        if (!admin) return null;

        const ok = await bcrypt.compare(parsed.data.password, admin.passwordHash);
        if (!ok) return null;

        return {
          id: admin.id,
          email: admin.email,
          name: admin.name,
        };
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as { id: string }).id;
        token.email = user.email ?? token.email;
        token.name = user.name ?? token.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id as string | undefined) ?? "";
      }
      return session;
    },
  },
});

// Module augmentation so `session.user.id` is typed.
/* eslint-disable */
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}
/* eslint-enable */