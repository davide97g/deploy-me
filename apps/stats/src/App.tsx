import { useEffect, useMemo, useState } from "react";
import { supabase, type Vendita } from "./lib/supabase";
import { aggrega, type Gruppo } from "./lib/stats";
import "./App.css";

const euro = new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" });
const numero = new Intl.NumberFormat("it-IT");
const dataOra = new Intl.DateTimeFormat("it-IT", {
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

const PALETTE = ["#c45c3e", "#5c6b4f", "#8a5a3c", "#b08968", "#7a8a6a", "#cd8b5e", "#9c4f36", "#6b5847"];

type Status = "loading" | "success" | "error";

export default function App() {
  const [vendite, setVendite] = useState<Vendita[]>([]);
  const [status, setStatus] = useState<Status>("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    let attivo = true;
    (async () => {
      // Lettura diretta dal database (serverless) — nessun backend nel mezzo.
      const { data, error } = await supabase.from("vendite").select("*");
      if (!attivo) return;
      if (error) {
        setError(error.message);
        setStatus("error");
        return;
      }
      setVendite(data);
      setStatus("success");
    })();
    return () => {
      attivo = false;
    };
  }, []);

  const s = useMemo(() => aggrega(vendite), [vendite]);
  const maxGiorno = Math.max(1, ...s.perGiorno.map((g) => g.quantita));

  return (
    <div className="cassa">
      <header className="cassa__header">
        <img src="/coffee-cup.svg" alt="" className="cassa__logo" width={40} height={40} />
        <div>
          <h1 className="cassa__title">Caffè del Deploy</h1>
          <p className="cassa__subtitle">Cassa · Statistiche</p>
        </div>
        <div className="cassa__conn" title="Il browser interroga Supabase via PostgREST, senza backend">
          <span className="cassa__dot" />
          <div>
            <strong>Supabase · edge</strong>
            <span className="cassa__conn-sub">lettura diretta · serverless</span>
          </div>
          <span className="cassa__mock">dati simulati</span>
        </div>
      </header>

      {status === "loading" && (
        <p className="cassa__hint" role="status">
          Interrogazione del database in corso…
        </p>
      )}

      {status === "error" && (
        <div className="cassa__error" role="alert">
          <strong>Database irraggiungibile</strong>
          <p>{error}</p>
        </div>
      )}

      {status === "success" && (
        <main className="cassa__main">
          <section className="cassa__kpis">
            <Kpi etichetta="Caffè venduti" valore={numero.format(s.caffeTotali)} />
            <Kpi etichetta="Incasso" valore={euro.format(s.incasso)} />
            <Kpi etichetta="Clienti" valore={numero.format(s.clienti)} />
            <Kpi etichetta="Scontrino medio" valore={euro.format(s.scontrinoMedio)} />
          </section>

          <div className="cassa__grid">
            <Pannello titolo="Per tipo di caffè" nota="cosa si beve">
              <Barre gruppi={s.perTipo} />
            </Pannello>

            <Pannello titolo="Per canale" nota="come si vende">
              <Barre gruppi={s.perCanale} />
            </Pannello>
          </div>

          <Pannello titolo="Migliori clienti" nota="a chi vendiamo">
            <Barre gruppi={s.topClienti} />
          </Pannello>

          <Pannello titolo="Vendite ultimi 14 giorni" nota="caffè al giorno">
            <div className="cassa__trend">
              {s.perGiorno.map((g, i) => (
                <div className="cassa__trend-col" key={i} title={`${g.quantita} caffè`}>
                  <div
                    className="cassa__trend-bar"
                    style={{ height: `${(g.quantita / maxGiorno) * 100}%` }}
                  />
                  <span className="cassa__trend-day">{g.giorno}</span>
                </div>
              ))}
            </div>
          </Pannello>

          <Pannello titolo="Ultimi ordini" nota="in tempo reale">
            <div className="cassa__table-wrap">
              <table className="cassa__table">
                <thead>
                  <tr>
                    <th>Quando</th>
                    <th>Caffè</th>
                    <th className="cassa__num">Qtà</th>
                    <th>Canale</th>
                    <th>Cliente</th>
                    <th className="cassa__num">Totale</th>
                  </tr>
                </thead>
                <tbody>
                  {s.ultimi.map((v) => (
                    <tr key={v.id}>
                      <td>{dataOra.format(new Date(v.creato_il))}</td>
                      <td>{v.caffe}</td>
                      <td className="cassa__num">{v.quantita}</td>
                      <td>
                        <span className="cassa__chip">{v.canale}</span>
                      </td>
                      <td>{v.cliente}</td>
                      <td className="cassa__num">{euro.format(v.quantita * v.prezzo_unitario)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Pannello>
        </main>
      )}

      <footer className="cassa__footer">
        Letto direttamente da Supabase — nessun backend nel mezzo.
      </footer>
    </div>
  );
}

function Kpi({ etichetta, valore }: { etichetta: string; valore: string }) {
  return (
    <div className="cassa__kpi">
      <span className="cassa__kpi-label">{etichetta}</span>
      <span className="cassa__kpi-value">{valore}</span>
    </div>
  );
}

function Pannello({
  titolo,
  nota,
  children,
}: {
  titolo: string;
  nota: string;
  children: React.ReactNode;
}) {
  return (
    <section className="cassa__panel">
      <div className="cassa__panel-head">
        <h2 className="cassa__panel-title">{titolo}</h2>
        <span className="cassa__panel-note">{nota}</span>
      </div>
      {children}
    </section>
  );
}

function Barre({ gruppi }: { gruppi: Gruppo[] }) {
  const max = Math.max(1, ...gruppi.map((g) => g.quantita));
  return (
    <ul className="cassa__bars">
      {gruppi.map((g, i) => (
        <li className="cassa__bar-row" key={g.nome}>
          <span className="cassa__bar-name">{g.nome}</span>
          <div className="cassa__bar-track">
            <div
              className="cassa__bar-fill"
              style={{ width: `${(g.quantita / max) * 100}%`, background: PALETTE[i % PALETTE.length] }}
            />
          </div>
          <span className="cassa__bar-val">{g.quantita}</span>
        </li>
      ))}
    </ul>
  );
}
