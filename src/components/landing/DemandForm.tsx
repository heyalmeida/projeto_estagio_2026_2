"use client";

import { useState, useTransition } from "react";
import { submitDemand, type SubmitDemandResult } from "@/app/actions/submit-demand";
import { Field } from "@/components/Field";
import { Textarea } from "@/components/Textarea";
import { Select } from "@/components/Select";
import { DEMAND_CATEGORIES } from "@/lib/constants";

const categoryOptions = DEMAND_CATEGORIES.map((value) => ({ value, label: value }));

export function DemandForm() {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<SubmitDemandResult | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isPending) return;

    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      const response = await submitDemand(null, formData);
      setResult(response);

      if (response.ok) {
        setFieldErrors({});
        // Reset the native form (after the success state renders).
        event.currentTarget.reset();
        return;
      }
      setFieldErrors(response.fieldErrors ?? {});
    });
  }

  if (result?.ok) {
    return (
      <div className="card p-8" role="status" aria-live="polite">
        <p className="text-sm font-semibold uppercase tracking-wider text-green-800">
          Demanda registrada
        </p>
        <h3 className="mt-2 font-editorial text-2xl text-charcoal-900">
          Recebemos sua solicitação
        </h3>
        <p className="mt-3 text-charcoal-700">
          Nossa equipe entrará em contato pelo e-mail informado para qualificar os detalhes
          e preparar a conexão com fornecedores compatíveis.
        </p>
        <dl className="mt-6 grid gap-1 rounded-md bg-ivory-100 p-4 text-sm">
          <dt className="text-charcoal-500">Protocolo de atendimento</dt>
          <dd className="font-mono text-base font-semibold text-charcoal-900">
            {result.protocol}
          </dd>
        </dl>
        <p className="mt-6 text-sm text-charcoal-500">
          Guarde este protocolo para referência futura. Você pode entrar em contato
          informando este código.
        </p>
        <button
          type="button"
          className="btn-secondary mt-6"
          onClick={() => setResult(null)}
        >
          Publicar outra demanda
        </button>
      </div>
    );
  }

  const topError = result && !result.ok ? result.message : null;

  return (
    <form onSubmit={onSubmit} className="card p-6 sm:p-8" noValidate>
      {topError && (
        <div
          role="alert"
          className="mb-6 rounded-md border border-red-100 bg-red-100/60 p-3 text-sm text-red-600"
        >
          {topError}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Nome do responsável pela compra"
          name="buyerName"
          autoComplete="name"
          required
          errors={fieldErrors.buyerName}
        />
        <Field
          label="E-mail corporativo"
          name="email"
          type="email"
          autoComplete="email"
          required
          errors={fieldErrors.email}
        />
        <Field
          label="Nome da empresa"
          name="companyName"
          autoComplete="organization"
          required
          errors={fieldErrors.companyName}
          className="sm:col-span-2"
        />
        <Select
          label="Categoria dos produtos"
          name="category"
          required
          placeholder="Selecione uma categoria"
          options={categoryOptions}
          errors={fieldErrors.category}
        />
        <Field
          label="Data desejada para entrega"
          name="deliveryDate"
          type="date"
          required
          errors={fieldErrors.deliveryDate}
        />
        <Field
          label="Quantidade pretendida"
          name="quantity"
          type="number"
          min={1}
          step={1}
          required
          hint="Em peças ou unidades do produto."
          errors={fieldErrors.quantity}
        />
        <Field
          label="Preço-alvo por unidade (opcional)"
          name="targetUnitPrice"
          type="text"
          inputMode="decimal"
          placeholder="ex.: 12,50"
          hint="Informe em reais. Usamos para estimar o valor potencial do pedido."
          errors={fieldErrors.targetUnitPrice}
        />
        <Textarea
          label="Grade ou tamanhos necessários"
          name="sizeGrade"
          required
          rows={2}
          placeholder="ex.: P 20 · M 40 · G 40"
          errors={fieldErrors.sizeGrade}
          className="sm:col-span-2"
        />
        <Textarea
          label="Observações sobre a demanda (opcional)"
          name="notes"
          rows={4}
          placeholder="Detalhes de tecido, cor, modelagem, referências visuais..."
          errors={fieldErrors.notes}
          className="sm:col-span-2"
        />
      </div>

      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-charcoal-500">
          Ao enviar, sua demanda é registrada com status <strong>pendente</strong> e
          seguirá para qualificação da equipe Vestaply.
        </p>
        <button type="submit" className="btn-primary" disabled={isPending}>
          {isPending ? "Enviando..." : "Publicar"}
        </button>
      </div>
    </form>
  );
}