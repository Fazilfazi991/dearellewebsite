import { createHash } from "node:crypto";
import type { Customer } from "./checkout";
import type { Quote } from "./quote";
export type Fulfilment =
  | "awaiting_contact"
  | "confirmed"
  | "packed"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "expired";
export type Order = {
  id: string;
  expiresAt?: string;
  payments?: {
    amount: number;
    reference: string;
    note: string;
    at: string;
    actor: string;
    kind: string;
  }[];
  createdAt: string;
  customer: Customer;
  quote: Quote;
  mode: "test";
  payment: "advance_pending" | "advance_verified" | "cod_collected";
  fulfilment: Fulfilment;
  tracking: string;
  version: number;
  history: { at: string; message: string }[];
};

export const hash = (value: string) =>
  createHash("sha256").update(value).digest("hex");
