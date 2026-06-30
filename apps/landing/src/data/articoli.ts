export interface Articolo {
  slug: string;
  categoria: string;
  titolo: string;
  dek: string;
  data: string; // ISO
  lettura: number; // minuti
  corpo: string[]; // paragrafi
}

// ponytail: contenuto moccato a mano. Diventa Markdown/CMS quando gli articoli saranno veri.
export const articoli: Articolo[] = [
  {
    slug: "quattro-deploy-un-monorepo",
    categoria: "Architettura",
    titolo: "Perché un monorepo merita quattro deploy diversi",
    dek: "Netlify, Vercel, Render, Fly. Quattro banchi, un solo bar. Storia di come abbiamo smesso di litigare su «dove va in produzione».",
    data: "2026-06-18",
    lettura: 6,
    corpo: [
      "C'è un momento, in ogni progetto, in cui qualcuno chiede: «ma alla fine dove lo deployiamo?». E parte la guerra di religione. Vercel contro Netlify, container contro funzioni serverless, chi ha ragione e chi paga la bolletta.",
      "La verità è che ogni pezzo del bar ha esigenze diverse. La vetrina è statica e vuole una CDN veloce: Netlify. Il bancone è una single page app React: Vercel la serve senza pensarci. La cucina è un'API Node che deve stare sempre accesa: Render. Il macinino è Python con un modello dietro, e gli serve un container vero: Fly.io.",
      "Invece di forzare tutto su una piattaforma sola, abbiamo lasciato che ogni app scegliesse la sua. Il monorepo tiene insieme il codice; i deploy restano indipendenti. Cambi il bancone e va in produzione solo il bancone.",
      "Il prezzo da pagare è qualche file di configurazione in più — un netlify.toml qui, un fly.toml là. Ma in cambio nessun deploy blocca un altro, e ogni servizio scala come gli pare. Un caffè alla volta.",
    ],
  },
  {
    slug: "cors-il-buttafuori-del-bancone",
    categoria: "Backend",
    titolo: "CORS, il buttafuori del bancone",
    dek: "Sta sulla porta, controlla chi entra, e ti rovina il pomeriggio se sbagli l'origine. Piccola guida per fare pace con lui.",
    data: "2026-06-11",
    lettura: 4,
    corpo: [
      "CORS è quel buttafuori che nessuno ha invitato ma che c'è sempre. Apri la console, vedi il preflight fallito, e improvvisamente il caffè è amaro.",
      "La regola è semplice: il browser chiede al server «posso far parlare questa pagina con te?». Se il server non risponde con l'origine giusta negli header, la richiesta muore prima ancora di partire. Non è un bug della tua fetch: è il bancone che dice no.",
      "Nella nostra cucina configuriamo l'origine consentita con una variabile d'ambiente, WEB_ORIGIN, così in locale il bancone gira su 5173 e in produzione punta al dominio vero. Stesso codice, buttafuori contento.",
      "Morale: non disabilitare CORS con un allow-origin a tappeto perché «tanto è una demo». Il buttafuori fa il suo lavoro. Dagli l'indirizzo giusto e ti lascia passare.",
    ],
  },
  {
    slug: "readme-che-si-fanno-leggere",
    categoria: "Scrittura",
    titolo: "README che si fanno leggere al primo sorso",
    dek: "Il primo file che apre chi arriva sul tuo repo. Eppure lo trattiamo come la lista della spesa. Tre mosse per cambiare.",
    data: "2026-06-03",
    lettura: 3,
    corpo: [
      "Il README è la vetrina del bar. Se è polveroso, la gente non entra — chiude il tab e va dal concorrente. Eppure continuiamo a scriverlo di fretta, alle 23, dopo l'ultimo commit.",
      "Prima mossa: la prima riga deve dire cosa fa il progetto, non come si chiama. «Trasforma note caotiche in copy pulita» dice più di qualsiasi nome creativo.",
      "Seconda mossa: i comandi per partire devono stare sopra la piega, copiabili in un blocco solo. Chi arriva vuole vedere qualcosa girare in trenta secondi, non leggere la tua filosofia di vita.",
      "Terza mossa: dai del tu a chi legge. Un README non è documentazione legale, è un barista che ti spiega il menu. Caldo, diretto, e senza far perdere tempo.",
    ],
  },
];
