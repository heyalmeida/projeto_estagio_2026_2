"use client";

import Link from "next/link";
import { Logo } from "@/components/Logo";
import { logoutAction } from "./actions";

interface AdminHeaderProps {
  adminName?: string | null;
  adminEmail?: string | null;
}

export function AdminHeader({ adminName, adminEmail }: AdminHeaderProps) {
  return (
    <header className="border-b border-charcoal-200/60 bg-white">
      <div className="mx-auto flex max-w-content items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <Link href="/admin" aria-label="Vestaply — painel administrativo">
            <Logo size="md" />
          </Link>
          <span className="hidden text-xs font-medium uppercase tracking-wider text-charcoal-400 sm:inline">
            Painel administrativo
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden text-right text-sm sm:block">
            <p className="font-medium text-charcoal-900">
              {adminName ?? "Administrador"}
            </p>
            {adminEmail && (
              <p className="text-xs text-charcoal-500">{adminEmail}</p>
            )}
          </div>
          <form action={logoutAction}>
            <button type="submit" className="btn-secondary">
              Sair
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}