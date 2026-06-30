import { pgTable, pgEnum, uuid, text, integer, doublePrecision, timestamp } from "drizzle-orm/pg-core";

// Stessi 4 canali del tipo `Canale` lato stats.
export const canaleEnum = pgEnum("canale", ["Al banco", "Asporto", "Domicilio", "Abbonamento"]);

// Chiavi JS in snake_case = nomi colonna: DB, supabase-js e JSON dell'api
// parlano tutti la stessa forma `Vendita`, nessuna traduzione di mezzo.
export const vendite = pgTable("vendite", {
  id: uuid("id").primaryKey().defaultRandom(),
  creato_il: timestamp("creato_il", { withTimezone: true }).notNull().defaultNow(),
  caffe: text("caffe").notNull(),
  quantita: integer("quantita").notNull(),
  // ponytail: double, non numeric — PostgREST/Drizzle restituiscono numeric come
  // stringa e romperebbero `quantita * prezzo_unitario`. Float basta per un bar demo.
  prezzo_unitario: doublePrecision("prezzo_unitario").notNull(),
  canale: canaleEnum("canale").notNull(),
  cliente: text("cliente").notNull(),
});

export type Vendita = typeof vendite.$inferSelect;
export type NuovaVendita = typeof vendite.$inferInsert;
