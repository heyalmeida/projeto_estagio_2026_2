"use client";

import { useState, useTransition } from "react";
import { loginAction, type LoginActionResult } from "./actions";
import { Field } from "@/components/Field";

export function LoginForm({ callbackUrl }: { callbackUrl: string }) {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<LoginActionResult | null>(null);

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isPending) return;
    const formData = new FormData(event.currentTarget);
    formData.set("callbackUrl", callbackUrl);

    startTransition(async () => {
      const response = await loginAction(null, formData);
      setResult(response);
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      {result && !result.ok && (
        <div
          role="alert"
          className="rounded-md border border-red-100 bg-red-100/60 p-3 text-sm text-red-600"
        >
          {result.message}
        </div>
      )}
      <Field
        label="E-mail"
        name="email"
        type="email"
        autoComplete="username"
        required
      />
      <Field
        label="Senha"
        name="password"
        type="password"
        autoComplete="current-password"
        required
      />
      <button type="submit" className="btn-primary w-full" disabled={isPending}>
        {isPending ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}