"use client";

import { useState, useTransition } from "react";
import {
  updateDemandStatus,
  confirmDemandAction,
  cancelDemandAction,
  setDemandStatus,
  type AdminActionResult,
} from "@/app/actions/admin";
import type { DemandStatus } from "@/lib/constants";

interface StatusActionsProps {
  demandId: string;
  currentStatus: DemandStatus;
}

export function StatusActions({ demandId, currentStatus }: StatusActionsProps) {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<AdminActionResult | null>(null);

  function run(status: DemandStatus) {
    const formData = new FormData();
    formData.set("id", demandId);
    formData.set("status", status);
    startTransition(async () => {
      const response = await updateDemandStatus(null, formData);
      setResult(response);
    });
  }

  return (
    <div className="flex flex-col gap-3">
      {result && !result.ok && (
        <div
          role="alert"
          className="rounded-md border border-red-100 bg-red-100/60 p-2 text-sm text-red-600"
        >
          {result.message}
        </div>
      )}
      {result && result.ok && (
        <div
          role="status"
          className="rounded-md border border-green-100 bg-green-100/60 p-2 text-sm text-green-800"
        >
          Status atualizado.
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => run("confirmado")}
          disabled={isPending || currentStatus === "confirmado"}
          className="btn-primary disabled:opacity-60"
        >
          Confirmar demanda
        </button>
        <button
          type="button"
          onClick={() => run("cancelado")}
          disabled={isPending || currentStatus === "cancelado"}
          className="btn-secondary disabled:opacity-60"
        >
          Cancelar demanda
        </button>
        <button
          type="button"
          onClick={() => run("pendente")}
          disabled={isPending || currentStatus === "pendente"}
          className="btn-ghost disabled:opacity-60"
        >
          Reabrir como pendente
        </button>
      </div>
      {/* Progressive-enhancement fallbacks — kept for non-JS environments */}
      <form action={confirmDemandAction} className="hidden">
        <input type="hidden" name="id" value={demandId} />
      </form>
      <form action={cancelDemandAction} className="hidden">
        <input type="hidden" name="id" value={demandId} />
      </form>
      <form action={setDemandStatus} className="hidden">
        <input type="hidden" name="id" value={demandId} />
      </form>
    </div>
  );
}