/**
 * Helpers for reading and normalising order documents stored in Firestore.
 * Orders are created by guests at checkout (src/lib/firestore.ts) and can
 * only be read / updated / deleted by administrators (see firestore.rules).
 */

export const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "shipped",
  "delivered",
  "cancelled",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export interface AdminOrderItem {
  id: string;
  brand: string;
  name: string;
  variant: string;
  price: number;
  image: string;
  quantity: number;
}

export interface AdminOrder {
  id: string;
  name: string;
  phone: string;
  address: string;
  notes: string;
  items: AdminOrderItem[];
  total: number;
  status: OrderStatus;
  createdAt?: number;
}

export interface FirestoreOrderData {
  [key: string]: unknown;
}

function toNumber(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}

function toMillis(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (value instanceof Date) return value.getTime();
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    // Firestore Timestamp
    if (typeof record.toMillis === "function") {
      const result = (record.toMillis as () => number)();
      return typeof result === "number" && Number.isFinite(result)
        ? result
        : undefined;
    }
    // { seconds, nanos } style timestamp
    if (typeof record.seconds === "number") {
      const result = record.seconds * 1000;
      return Number.isFinite(result) ? result : undefined;
    }
  }
  return undefined;
}

function toStatus(value: unknown): OrderStatus {
  return typeof value === "string" &&
    (ORDER_STATUSES as readonly string[]).includes(value)
    ? (value as OrderStatus)
    : "pending";
}

export function orderFromFirestore(
  id: string,
  data: FirestoreOrderData
): AdminOrder | null {
  if (!data || typeof data !== "object") return null;

  const items = Array.isArray(data.items)
    ? data.items
        .filter(
          (item): item is Record<string, unknown> =>
            item != null && typeof item === "object"
        )
        .map((item) => ({
          id: typeof item.id === "string" ? item.id : "",
          brand: typeof item.brand === "string" ? item.brand : "",
          name:
            typeof item.name === "string" && item.name.trim() !== ""
              ? item.name.trim()
              : "Item",
          variant: typeof item.variant === "string" ? item.variant : "",
          price: toNumber(item.price) ?? 0,
          image: typeof item.image === "string" ? item.image : "",
          quantity: Math.max(1, Math.round(toNumber(item.quantity) ?? 1)),
        }))
    : [];

  if (items.length === 0) return null;

  const name =
    typeof data.name === "string" && data.name.trim() !== ""
      ? data.name.trim()
      : "Unknown customer";

  return {
    id,
    name,
    phone: typeof data.phone === "string" ? data.phone : "",
    address: typeof data.address === "string" ? data.address : "",
    notes: typeof data.notes === "string" ? data.notes : "",
    items,
    total: Math.max(0, toNumber(data.total) ?? 0),
    status: toStatus(data.status),
    createdAt: toMillis(data.createdAt),
  };
}

export function formatMoney(value: number): string {
  return Number.isFinite(value) ? Math.round(value).toLocaleString() : "—";
}

export function formatOrderDate(value: unknown): string {
  const millis = toMillis(value);
  if (!millis) return "Date unknown";
  return new Date(millis).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}