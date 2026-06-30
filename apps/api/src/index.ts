import "dotenv/config";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { desc } from "drizzle-orm";
import type { OrdinaRequest, OrdinaResponse } from "@caffe-del-deploy/shared";
import { listino } from "./caffe.js";
import { db } from "./db/index.js";
import { vendite, canaleEnum } from "./db/schema.js";

const app = new Hono();

const webOrigin = process.env.WEB_ORIGIN ?? "http://localhost:5173";
const engineUrl = process.env.ENGINE_URL ?? "http://localhost:8000";
const port = Number(process.env.PORT ?? 3000);

app.use(
  "*",
  cors({
    origin: webOrigin,
    allowMethods: ["GET", "POST", "OPTIONS"],
    allowHeaders: ["Content-Type"],
  }),
);

async function probeMacinino(): Promise<"online" | "offline"> {
  try {
    const res = await fetch(`${engineUrl}/health`, { signal: AbortSignal.timeout(3000) });
    return res.ok ? "online" : "offline";
  } catch {
    return "offline";
  }
}

app.get("/", (c) =>
  c.json({
    app: "Cucina v2",
    host: "Render",
    service: "Hono · web service",
    runtime: "Node",
  }),
);

app.get("/health", async (c) => {
  const macinino = await probeMacinino();
  return c.json({ status: "aperto", macinino });
});

app.get("/caffe", (c) => c.json(listino));

// Stessa tabella `vendite` che la Cassa legge direttamente da Supabase,
// qui via Drizzle (l'api è owner -> bypassa RLS, legge e scrive).
app.get("/vendite", async (c) => {
  const rows = await db.select().from(vendite).orderBy(desc(vendite.creato_il));
  return c.json(rows);
});

app.post("/vendite", async (c) => {
  const b = (await c.req.json().catch(() => null)) as Record<string, unknown> | null;
  // Validazione al confine: niente fiducia nel body, niente 500 da Postgres.
  if (
    !b ||
    typeof b.caffe !== "string" ||
    typeof b.cliente !== "string" ||
    typeof b.quantita !== "number" ||
    typeof b.prezzo_unitario !== "number" ||
    !canaleEnum.enumValues.includes(b.canale as (typeof canaleEnum.enumValues)[number])
  ) {
    return c.json(
      { error: `Campi richiesti: caffe, cliente (string), quantita, prezzo_unitario (number), canale (${canaleEnum.enumValues.join(" | ")})` },
      400,
    );
  }
  const [riga] = await db
    .insert(vendite)
    .values({
      caffe: b.caffe,
      cliente: b.cliente,
      quantita: b.quantita,
      prezzo_unitario: b.prezzo_unitario,
      canale: b.canale as (typeof canaleEnum.enumValues)[number],
    })
    .returning();
  return c.json(riga, 201);
});

async function handleOrdina(note: string): Promise<OrdinaResponse> {
  const res = await fetch(`${engineUrl}/macina`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ note }),
    signal: AbortSignal.timeout(60000),
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(detail || `Engine responded ${res.status}`);
  }

  return (await res.json()) as OrdinaResponse;
}

app.post("/ordina", async (c) => {
  const body = (await c.req.json()) as OrdinaRequest;
  if (!body.note?.trim()) {
    return c.json({ error: "Note vuote — cosa vuoi ordinare?" }, 400);
  }

  try {
    const result = await handleOrdina(body.note.trim());
    return c.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Errore sconosciuto";
    return c.json({ error: `Macinino fuori servizio: ${message}` }, 502);
  }
});

app.post("/transform", async (c) => {
  const body = (await c.req.json()) as { text?: string; note?: string };
  const note = body.note ?? body.text ?? "";
  if (!note.trim()) {
    return c.json({ error: "Note vuote" }, 400);
  }
  try {
    const result = await handleOrdina(note.trim());
    return c.json({ result: result.risultato, risultato: result.risultato });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Errore sconosciuto";
    return c.json({ error: message }, 502);
  }
});

serve({ fetch: app.fetch, port }, () => {
  console.log(`Cucina aperta su http://localhost:${port}`);
});
