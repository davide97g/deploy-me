import { useState } from "react";
import Barista from "./Barista";
import Listino from "./Listino";
import "./App.css";

type Tab = "banco" | "listino";

export default function App() {
  const [tab, setTab] = useState<Tab>("banco");

  return (
    <div className="bancone">
      <header className="bancone__header">
        <img src="/coffee-cup.svg" alt="" className="bancone__logo" width={40} height={40} />
        <div>
          <h1 className="bancone__title">Caffè del Deploy</h1>
          <p className="bancone__subtitle">Bancone</p>
        </div>
        <div className="bancone__conn" title="Frontend statico servito dalla CDN edge di Vercel">
          <span className="bancone__dot" />
          <div>
            <strong>Vercel · edge</strong>
            <span className="bancone__conn-sub">React + Vite · statico</span>
          </div>
        </div>
      </header>

      <nav className="tabs" aria-label="Sezioni del bar">
        <button
          type="button"
          className={tab === "banco" ? "tabs__btn tabs__btn--on" : "tabs__btn"}
          aria-current={tab === "banco"}
          onClick={() => setTab("banco")}
        >
          Al banco
        </button>
        <button
          type="button"
          className={tab === "listino" ? "tabs__btn tabs__btn--on" : "tabs__btn"}
          aria-current={tab === "listino"}
          onClick={() => setTab("listino")}
        >
          Il listino
        </button>
      </nav>

      <main className="bancone__main">
        {tab === "banco" ? (
          <div className="banco-narrow">
            <Barista />
          </div>
        ) : (
          <Listino />
        )}
      </main>

      <footer className="bancone__footer">Dal caos al commit. Un caffè alla volta.</footer>
    </div>
  );
}
