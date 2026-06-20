// A tiny payments codebase used by the grounded demo + tests.
import type { FileDoc } from "../src/codebase/types.ts";

function doc(path: string, content: string): FileDoc {
  return { path, language: "typescript", content, sizeBytes: Buffer.byteLength(content) };
}

export const SAMPLE_REPO: FileDoc[] = [
  doc(
    "src/db.ts",
    `// Orders persistence layer.
export interface OrderRow { id: string; amountCents: number; currency: string; }
const orders = new Map<string, OrderRow>();

export function saveOrder(row: OrderRow) {
  orders.set(row.id, row);
  return row;
}
export function getOrder(id: string) {
  return orders.get(id) ?? null;
}
`,
  ),
  doc(
    "src/orders.ts",
    `import { saveOrder } from "./db";

// Create an order. Money is stored as integer cents.
export function createOrder(amountCents: number, currency: string) {
  return saveOrder({ id: crypto.randomUUID(), amountCents, currency });
}
`,
  ),
  doc(
    "src/payments.ts",
    `import { createOrder } from "./orders";

// Charge a customer's card and record the order.
export async function charge(amountCents: number, currency: string, card: string) {
  const last4 = card.slice(-4); // never log the full card number
  console.log("charging card ending", last4);
  return createOrder(amountCents, currency);
}
`,
  ),
];
