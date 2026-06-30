import "dotenv/config";
import { sql } from "drizzle-orm";
import { db } from "./index.js";
import { vendite, type NuovaVendita } from "./schema.js";

// Stesso generatore deterministico che prima viveva nel mock di apps/stats:
// seed fisso -> dati stabili, ~72 vendite sugli ultimi 14 giorni.

type Canale = "Al banco" | "Asporto" | "Domicilio" | "Abbonamento";

function lcg(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

function pesato<T extends { peso: number }>(items: T[], rng: () => number): T {
  const totale = items.reduce((s, i) => s + i.peso, 0);
  let r = rng() * totale;
  for (const it of items) {
    r -= it.peso;
    if (r <= 0) return it;
  }
  return items[items.length - 1];
}

function generaVendite(): NuovaVendita[] {
  const GIORNI = 14;
  const ORDINI = 72;
  const rng = lcg(20260629);

  const tipi = [
    { nome: "Espresso", prezzo: 1.2, peso: 30 },
    { nome: "Cappuccino", prezzo: 1.6, peso: 22 },
    { nome: "Macchiato", prezzo: 1.3, peso: 12 },
    { nome: "Caffè Lungo", prezzo: 1.3, peso: 8 },
    { nome: "Marocchino", prezzo: 1.8, peso: 8 },
    { nome: "Cortado", prezzo: 1.5, peso: 7 },
    { nome: "Flat White", prezzo: 2.2, peso: 7 },
    { nome: "Ristretto", prezzo: 1.2, peso: 6 },
  ];
  const canali: { nome: Canale; peso: number }[] = [
    { nome: "Al banco", peso: 50 },
    { nome: "Asporto", peso: 28 },
    { nome: "Domicilio", peso: 14 },
    { nome: "Abbonamento", peso: 8 },
  ];
  const clienti = [
    { nome: "Team Frontend", peso: 14 },
    { nome: "Ufficio Piano 2", peso: 12 },
    { nome: "Bar Centrale", peso: 10 },
    { nome: "Studio Rossi", peso: 8 },
    { nome: "Giulia R.", peso: 7 },
    { nome: "Marco V.", peso: 6 },
    { nome: "Luca DevOps", peso: 6 },
    { nome: "Sara B.", peso: 5 },
    { nome: "Cliente di passaggio", peso: 22 },
  ];
  const QTA = [
    { nome: 1, peso: 60 },
    { nome: 2, peso: 25 },
    { nome: 3, peso: 10 },
    { nome: 5, peso: 5 },
  ];

  const rows: NuovaVendita[] = [];
  for (let i = 0; i < ORDINI; i++) {
    const tipo = pesato(tipi, rng);
    const canale = pesato(canali, rng).nome;
    const cliente = pesato(clienti, rng).nome;
    const quantita = canale === "Abbonamento" ? 4 + Math.floor(rng() * 9) : pesato(QTA, rng).nome;

    const d = new Date();
    d.setDate(d.getDate() - Math.floor(rng() * GIORNI));
    d.setHours(7 + Math.floor(rng() * 11), Math.floor(rng() * 60), 0, 0);

    // id generato dal DB (uuid); creato_il esplicito per spalmarlo sui 14 giorni.
    rows.push({ creato_il: d, caffe: tipo.nome, quantita, prezzo_unitario: tipo.prezzo, canale, cliente });
  }
  return rows;
}

async function main() {
  // RLS: il browser (anon key) legge in sola lettura; l'api usa la connessione
  // postgres (owner della tabella) e bypassa RLS -> CRUD completo.
  await db.execute(sql`alter table vendite enable row level security`);
  await db.execute(sql`drop policy if exists "anon legge vendite" on vendite`);
  await db.execute(sql`create policy "anon legge vendite" on vendite for select to anon using (true)`);

  await db.delete(vendite); // idempotente: ripulisci e riseed
  const rows = generaVendite();
  await db.insert(vendite).values(rows);

  console.log(`Seed ok: ${rows.length} vendite + RLS anon read-only.`);
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
