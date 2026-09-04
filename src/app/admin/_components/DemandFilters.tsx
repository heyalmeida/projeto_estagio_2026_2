"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { Field } from "@/components/Field";
import { Select } from "@/components/Select";
import { DEMAND_CATEGORIES, DEMAND_STATUS, STATUS_LABEL } from "@/lib/constants";

const statusOptions = [
  { value: "todos", label: "Todos os status" },
  ...DEMAND_STATUS.map((s) => ({ value: s, label: STATUS_LABEL[s] })),
];

const categoryOptions = [
  { value: "todas", label: "Todas as categorias" },
  ...DEMAND_CATEGORIES.map((c) => ({ value: c, label: c })),
];

export function DemandFilters() {
  const router = useRouter();
  const params = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentSearch = params.get("q") ?? "";
  const currentStatus = params.get("status") ?? "todos";
  const currentCategory = params.get("category") ?? "todas";

  function update(name: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (!value) next.delete(name);
    else next.set(name, value);
    startTransition(() => {
      router.replace(`/admin?${next.toString()}`);
    });
  }

  return (
    <section
      aria-label="Filtros"
      className="card grid gap-3 p-4 md:grid-cols-[1fr_220px_220px]"
    >
      <Field
        label="Buscar"
        name="q"
        placeholder="Empresa, comprador ou protocolo"
        defaultValue={currentSearch}
        onChange={(event) => update("q", event.target.value)}
      />
      <Select
        label="Status"
        name="status"
        value={currentStatus}
        onChange={(event) => update("status", event.target.value)}
        options={statusOptions}
      />
      <Select
        label="Categoria"
        name="category"
        value={currentCategory}
        onChange={(event) => update("category", event.target.value)}
        options={categoryOptions}
      />
      {isPending && (
        <p className="md:col-span-3 text-xs text-charcoal-400">Atualizando…</p>
      )}
    </section>
  );
}