// Single source of truth for allowed domain values.
// Anything coming from the client must be validated against these lists
// before reaching the database layer.

export const DEMAND_STATUS = ["pendente", "confirmado", "cancelado"] as const;
export type DemandStatus = (typeof DEMAND_STATUS)[number];

export const DEMAND_CATEGORIES = [
  "Moda feminina",
  "Moda masculina",
  "Moda infantil",
  "Fitness",
  "Acessórios",
] as const;
export type DemandCategory = (typeof DEMAND_CATEGORIES)[number];

export const DEFAULT_DEMAND_STATUS: DemandStatus = "pendente";

export const STATUS_LABEL: Record<DemandStatus, string> = {
  pendente: "Pendente",
  confirmado: "Confirmado",
  cancelado: "Cancelado",
};

// Protocol prefix per the brief: VST-YYYY-XXXXXX
export const PROTOCOL_PREFIX = "VST";