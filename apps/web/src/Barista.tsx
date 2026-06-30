import { useState } from "react";
import type { OrdinaResponse } from "@caffe-del-deploy/shared";
import { API_URL } from "./api";

const PLACEHOLDER =
  "ok quindi ho fatto un monorepo con turbo, ci sono 4 app, una va su vercel una su netlify... boh il readme fa schifo aiutami";

type Status = "idle" | "loading" | "success" | "error";

export default function Barista() {
  const [note, setNote] = useState("");
  const [risultato, setRisultato] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  async function ordina() {
    if (!note.trim()) return;
    setStatus("loading");
    setError("");
    setRisultato("");

    try {
      const res = await fetch(`${API_URL}/ordina`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note: note.trim() }),
      });
      const data = (await res.json()) as OrdinaResponse & { error?: string };
      if (!res.ok) {
        throw new Error(data.error ?? "Qualcosa è andato storto");
      }
      setRisultato(data.risultato);
      setStatus("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Macinino fuori servizio");
      setStatus("error");
    }
  }

  return (
    <>
      <label className="bancone__label" htmlFor="note">
        Cosa vuoi ordinare?
      </label>
      <textarea
        id="note"
        className="bancone__textarea"
        rows={6}
        placeholder={PLACEHOLDER}
        value={note}
        onChange={(e) => setNote(e.target.value)}
        disabled={status === "loading"}
      />

      <button
        type="button"
        className="bancone__cta"
        onClick={ordina}
        disabled={status === "loading" || !note.trim()}
      >
        {status === "loading" ? "Estrazione in corso…" : "Ordina"}
      </button>

      {status === "loading" && (
        <div className="bancone__steam" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
      )}

      {status === "error" && (
        <div className="bancone__error" role="alert">
          <strong>Macinino fuori servizio</strong>
          <p>{error}</p>
          <button type="button" className="bancone__retry" onClick={ordina}>
            Riprova
          </button>
        </div>
      )}

      {status === "success" && risultato && (
        <article className="bancone__saucer">
          <p className="bancone__saucer-label">Ordine pronto</p>
          <div className="bancone__saucer-content">{risultato}</div>
        </article>
      )}
    </>
  );
}
