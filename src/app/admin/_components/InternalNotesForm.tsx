"use client";

import { useState, useTransition } from "react";
import { Textarea } from "@/components/Textarea";
import {
  updateInternalNotes,
  type AdminActionResult,
} from "@/app/actions/admin";

export function InternalNotesForm({
  demandId,
  initialNotes,
}: {
  demandId: string;
  initialNotes: string | null;
}) {
  const [isPending, startTransition] = useTransition();
  const [value, setValue] = useState(initialNotes ?? "");
  const [result, setResult] = useState<AdminActionResult | null>(null);

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isPending) return;
    const formData = new FormData();
    formData.set("id", demandId);
    formData.set("internalNotes", value);
    startTransition(async () => {
      const response = await updateInternalNotes(null, formData);
      setResult(response);
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <Textarea
        label="Observação interna"
        name="internalNotes"
        rows={4}
        placeholder="Anotações privadas para a equipe Vestaply."
        value={value}
        onChange={(event) => setValue(event.target.value)}
        errors={result && !result.ok ? result.fieldErrors?.internalNotes : undefined}
      />
      {result && !result.ok && (
        <p role="alert" className="text-sm text-red-600">
          {result.message}
        </p>
      )}
      {result && result.ok && (
        <p role="status" className="text-sm text-green-800">
          Observação salva.
        </p>
      )}
      <div className="flex justify-end">
        <button type="submit" className="btn-primary" disabled={isPending}>
          {isPending ? "Salvando..." : "Salvar observação"}
        </button>
      </div>
    </form>
  );
}