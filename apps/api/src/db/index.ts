import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema.js";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL non impostata (vedi apps/api/.env)");

// prepare:false: il transaction pooler Supabase (porta 6543) non supporta i
// prepared statement. Innocuo anche in session mode (5432), se mai cambierai.
const client = postgres(url, { prepare: false });
export const db = drizzle(client, { schema });
