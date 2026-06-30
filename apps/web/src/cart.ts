import type { Caffe } from "@caffe-del-deploy/shared";

export type Cart = Record<string, number>; // id → quantità

// Soldi in centesimi interi: sommare float (1.1 + 2.2) sballa al centesimo.
export const cents = (eur: number) => Math.round(eur * 100);

export function totaleCents(caffe: Caffe[], cart: Cart): number {
  return caffe.reduce((sum, c) => sum + cents(c.prezzo) * (cart[c.id] ?? 0), 0);
}

export function numPezzi(cart: Cart): number {
  return Object.values(cart).reduce((n, q) => n + q, 0);
}

export const formatEuro = (centesimi: number) =>
  new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(centesimi / 100);
