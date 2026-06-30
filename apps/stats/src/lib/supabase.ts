// La Cassa legge le statistiche DIRETTAMENTE dal database (serverless):
// il browser interroga Supabase via PostgREST, senza passare da apps/api.
// La anon key è sicura lato browser perché la tabella `vendite` ha RLS
// con una policy di sola lettura per il ruolo `anon` (vedi apps/api/src/db/seed.ts).
// I dati li semina l'api (Drizzle); qui leggiamo soltanto.
import { createClient } from "@supabase/supabase-js";

export type Canale = "Al banco" | "Asporto" | "Domicilio" | "Abbonamento";

/** Una riga della tabella `vendite` su Supabase. */
export interface Vendita {
  id: string;
  creato_il: string; // ISO timestamp
  caffe: string;
  quantita: number;
  prezzo_unitario: number; // euro
  canale: Canale;
  cliente: string;
}

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY!,
);
