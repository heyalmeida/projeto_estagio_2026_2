"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/lib/auth";
import { loginSchema } from "@/lib/validators";

export type LoginActionResult =
  | { ok: true }
  | { ok: false; message: string };

/**
 * Server Action used by the login form. Performs the actual
 * authentication via Auth.js's `signIn`. On success, redirects to the
 * callbackUrl (defaults to /admin). On failure, returns a generic
 * error message — no distinction between wrong email and wrong password.
 */
export async function loginAction(
  _prev: unknown,
  formData: FormData,
): Promise<LoginActionResult> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { ok: false, message: "Informe e-mail e senha válidos." };
  }

  const callbackUrl = String(formData.get("callbackUrl") ?? "/admin");

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: callbackUrl,
    });
    return { ok: true };
  } catch (error) {
    // Auth.js throws a special redirect error after a successful login;
    // re-throw it so Next.js handles the navigation.
    if (error instanceof Error && error.message === "NEXT_REDIRECT") {
      throw error;
    }
    if (error instanceof AuthError) {
      return { ok: false, message: "E-mail ou senha inválidos." };
    }
    return { ok: false, message: "Não foi possível entrar. Tente novamente." };
  }
}