import type { Caffe } from "@caffe-del-deploy/shared";

// ponytail: static menu, mocked. Move to a DB if it ever needs editing at runtime.
export const listino: Caffe[] = [
  {
    id: "espresso-main",
    nome: "Espresso sul Main",
    descrizione: "Singolo, deciso, niente fronzoli. Il commit che parte dritto in produzione.",
    prezzo: 1.1,
    intensita: 5,
    origine: "Sumatra",
    tags: ["classico", "senza zucchero"],
  },
  {
    id: "doppio-deploy",
    nome: "Doppio Deploy",
    descrizione: "Due shot per le notti di rilascio. Quando il main non aspetta nessuno.",
    prezzo: 1.8,
    intensita: 5,
    origine: "Brasile",
    tags: ["doppio", "intenso"],
  },
  {
    id: "macchiato-merge",
    nome: "Macchiato del Merge",
    descrizione: "Espresso con una goccia di latte. Giusto per ammorbidire il conflict.",
    prezzo: 1.3,
    intensita: 4,
    origine: "Etiopia",
    tags: ["con latte"],
  },
  {
    id: "cappuccino-ci",
    nome: "Cappuccino CI/CD",
    descrizione: "Schiuma stabile, pipeline verde. Colazione prima del primo push.",
    prezzo: 1.6,
    intensita: 3,
    origine: "Guatemala",
    tags: ["con latte", "mattina"],
  },
  {
    id: "decaffe-staging",
    nome: "Decaffè di Staging",
    descrizione: "Tutto il gusto, zero ansia. Per provare senza svegliare il pager.",
    prezzo: 1.4,
    intensita: 1,
    origine: "Colombia",
    tags: ["decaffeinato"],
  },
  {
    id: "freddo-rollback",
    nome: "Shakerato del Rollback",
    descrizione: "Freddo, ghiacciato, salvifico. Quando il deploy va indietro di corsa.",
    prezzo: 2.2,
    intensita: 2,
    origine: "Kenya",
    tags: ["freddo", "estate"],
  },
];
