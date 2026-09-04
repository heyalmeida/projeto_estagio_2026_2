import clsx from "clsx";
import type { DemandStatus } from "@/lib/constants";
import { STATUS_LABEL } from "@/lib/constants";

const styles: Record<DemandStatus, string> = {
  pendente: "badge badge-pendente",
  confirmado: "badge badge-confirmado",
  cancelado: "badge badge-cancelado",
};

export function StatusBadge({ status }: { status: DemandStatus }) {
  return (
    <span className={clsx(styles[status])}>
      <span
        className={clsx("h-1.5 w-1.5 rounded-full", {
          "bg-amber-500": status === "pendente",
          "bg-green-800": status === "confirmado",
          "bg-red-600": status === "cancelado",
        })}
        aria-hidden
      />
      {STATUS_LABEL[status]}
    </span>
  );
}