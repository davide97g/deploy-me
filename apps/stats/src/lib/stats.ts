import type { Vendita } from "./supabase";

export interface Gruppo {
  nome: string;
  quantita: number;
  incasso: number;
}

export interface Aggregato {
  caffeTotali: number;
  incasso: number;
  ordini: number;
  clienti: number;
  scontrinoMedio: number;
  perTipo: Gruppo[];
  perCanale: Gruppo[];
  topClienti: Gruppo[];
  perGiorno: { giorno: string; quantita: number }[];
  ultimi: Vendita[];
}

/** Calcola tutte le statistiche dalle righe grezze (come faresti dopo un SELECT). */
export function aggrega(vendite: Vendita[]): Aggregato {
  const caffeTotali = vendite.reduce((s, v) => s + v.quantita, 0);
  const incasso = vendite.reduce((s, v) => s + v.quantita * v.prezzo_unitario, 0);
  const ordini = vendite.length;
  const clienti = new Set(vendite.map((v) => v.cliente)).size;

  const perTipo = raggruppa(vendite, (v) => v.caffe);
  const perCanale = raggruppa(vendite, (v) => v.canale);
  const topClienti = raggruppa(vendite, (v) => v.cliente).slice(0, 6);

  return {
    caffeTotali,
    incasso,
    ordini,
    clienti,
    scontrinoMedio: ordini ? incasso / ordini : 0,
    perTipo,
    perCanale,
    topClienti,
    perGiorno: perGiorno(vendite, 14),
    ultimi: [...vendite]
      .sort((a, b) => b.creato_il.localeCompare(a.creato_il))
      .slice(0, 8),
  };
}

function raggruppa(vendite: Vendita[], chiave: (v: Vendita) => string): Gruppo[] {
  const mappa = new Map<string, Gruppo>();
  for (const v of vendite) {
    const k = chiave(v);
    const g = mappa.get(k) ?? { nome: k, quantita: 0, incasso: 0 };
    g.quantita += v.quantita;
    g.incasso += v.quantita * v.prezzo_unitario;
    mappa.set(k, g);
  }
  return [...mappa.values()].sort((a, b) => b.quantita - a.quantita);
}

/** Quantità venduta negli ultimi `giorni` giorni, dal più vecchio al più recente. */
function perGiorno(vendite: Vendita[], giorni: number): { giorno: string; quantita: number }[] {
  const oggi = new Date();
  oggi.setHours(0, 0, 0, 0);

  const slot = Array.from({ length: giorni }, (_, i) => {
    const d = new Date(oggi);
    d.setDate(d.getDate() - (giorni - 1 - i));
    return { chiave: d.toISOString().slice(0, 10), giorno: String(d.getDate()), quantita: 0 };
  });
  const indice = new Map(slot.map((s) => [s.chiave, s]));

  for (const v of vendite) {
    const s = indice.get(v.creato_il.slice(0, 10));
    if (s) s.quantita += v.quantita;
  }
  return slot.map(({ giorno, quantita }) => ({ giorno, quantita }));
}
