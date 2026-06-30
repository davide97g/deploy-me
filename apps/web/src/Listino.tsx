import { useEffect, useMemo, useState } from "react";
import type { Caffe } from "@caffe-del-deploy/shared";
import { API_URL } from "./api";
import { type Cart, totaleCents, numPezzi, formatEuro, cents } from "./cart";

type Load = "loading" | "ready" | "error";

function Intensita({ livello }: { livello: number }) {
  return (
    <span className="chicchi" title={`Intensità ${livello}/5`} aria-label={`Intensità ${livello} su 5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={i < livello ? "chicco chicco--on" : "chicco"} aria-hidden="true" />
      ))}
    </span>
  );
}

export default function Listino() {
  const [caffe, setCaffe] = useState<Caffe[]>([]);
  const [load, setLoad] = useState<Load>("loading");
  const [cart, setCart] = useState<Cart>({});
  const [pagato, setPagato] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/caffe`)
      .then((res) => {
        if (!res.ok) throw new Error(`API ${res.status}`);
        return res.json() as Promise<Caffe[]>;
      })
      .then((data) => {
        setCaffe(data);
        setLoad("ready");
      })
      .catch(() => setLoad("error"));
  }, []);

  const add = (id: string) => {
    setPagato(false);
    setCart((c) => ({ ...c, [id]: (c[id] ?? 0) + 1 }));
  };
  const sub = (id: string) =>
    setCart((c) => {
      const q = (c[id] ?? 0) - 1;
      if (q <= 0) {
        const rest = { ...c };
        delete rest[id];
        return rest;
      }
      return { ...c, [id]: q };
    });

  const totale = useMemo(() => totaleCents(caffe, cart), [caffe, cart]);
  const pezzi = numPezzi(cart);
  const righe = caffe.filter((c) => cart[c.id]);

  if (load === "loading") return <p className="listino__msg">Sto scaldando la macchina…</p>;
  if (load === "error")
    return (
      <div className="bancone__error" role="alert">
        <strong>Listino non disponibile</strong>
        <p>La cucina non risponde. Riprova tra poco.</p>
      </div>
    );

  return (
    <div className="listino">
      <ul className="listino__grid">
        {caffe.map((c) => (
          <li key={c.id} className="caffe-card">
            <div className="caffe-card__top">
              <h3 className="caffe-card__nome">{c.nome}</h3>
              <span className="caffe-card__prezzo">{formatEuro(cents(c.prezzo))}</span>
            </div>
            <p className="caffe-card__desc">{c.descrizione}</p>
            <div className="caffe-card__specs">
              <Intensita livello={c.intensita} />
              <span className="caffe-card__origine">{c.origine}</span>
            </div>
            <div className="caffe-card__tags">
              {c.tags.map((t) => (
                <span key={t} className="pill">{t}</span>
              ))}
            </div>
            <button type="button" className="caffe-card__add" onClick={() => add(c.id)}>
              {cart[c.id] ? `Nel conto · ${cart[c.id]}` : "Aggiungi"}
            </button>
          </li>
        ))}
      </ul>

      <aside className="scontrino" aria-label="Il tuo conto">
        <div className="scontrino__head">
          <span>Caffè del Deploy</span>
          <span>Il conto</span>
        </div>

        {righe.length === 0 ? (
          <p className="scontrino__vuoto">Il banco è vuoto. Aggiungi un caffè dal listino.</p>
        ) : (
          <>
            <ul className="scontrino__righe">
              {righe.map((c) => (
                <li key={c.id} className="scontrino__riga">
                  <div className="scontrino__qty">
                    <button type="button" onClick={() => sub(c.id)} aria-label={`Togli un ${c.nome}`}>−</button>
                    <span>{cart[c.id]}</span>
                    <button type="button" onClick={() => add(c.id)} aria-label={`Aggiungi un ${c.nome}`}>+</button>
                  </div>
                  <span className="scontrino__nome">{c.nome}</span>
                  <span className="scontrino__lead" aria-hidden="true" />
                  <span className="scontrino__importo">{formatEuro(cents(c.prezzo) * cart[c.id])}</span>
                </li>
              ))}
            </ul>

            <div className="scontrino__totale">
              <span>Totale · {pezzi} {pezzi === 1 ? "pezzo" : "pezzi"}</span>
              <span className="scontrino__lead" aria-hidden="true" />
              <strong>{formatEuro(totale)}</strong>
            </div>

            <button type="button" className="scontrino__paga" onClick={() => setPagato(true)}>
              Paga al banco
            </button>
          </>
        )}

        {pagato && (
          <p className="scontrino__grazie" role="status">
            Ordine registrato. Ritira al bancone — il barista sta macinando.
          </p>
        )}
      </aside>
    </div>
  );
}
