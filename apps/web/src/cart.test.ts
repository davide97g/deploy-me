import assert from "node:assert/strict";
import type { Caffe } from "@caffe-del-deploy/shared";
import { totaleCents, numPezzi, formatEuro } from "./cart.js";

const menu: Caffe[] = [
  { id: "a", nome: "A", descrizione: "", prezzo: 1.1, intensita: 5, origine: "", tags: [] },
  { id: "b", nome: "B", descrizione: "", prezzo: 2.2, intensita: 3, origine: "", tags: [] },
];

// Il caso che rompe i float: 1.1 + 2.2 = 3.3000000000000003 in virgola mobile.
assert.equal(totaleCents(menu, { a: 1, b: 1 }), 330);
assert.equal(totaleCents(menu, { a: 3 }), 330);
assert.equal(totaleCents(menu, {}), 0);
assert.equal(totaleCents(menu, { fantasma: 9 }), 0); // id non nel menu → ignorato
assert.equal(numPezzi({ a: 2, b: 3 }), 5);
assert.equal(formatEuro(330).replace(/\s/g, " "), "3,30 €");

console.log("cart: ok");
