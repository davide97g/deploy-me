export interface OrdinaRequest {
  note: string;
}

export interface OrdinaResponse {
  risultato: string;
}

export interface HealthResponse {
  status: string;
  macinino?: "online" | "offline";
  barista?: string;
}

export interface Caffe {
  id: string;
  nome: string;
  descrizione: string;
  prezzo: number; // euro
  intensita: number; // 1–5
  origine: string;
  tags: string[];
}
