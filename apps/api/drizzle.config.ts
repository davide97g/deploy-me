import "dotenv/config";
import { defineConfig } from "drizzle-kit";

// push/DDL gira meglio in session mode (5432): il transaction pooler (6543)
// non regge i lock e i prepared statement che drizzle-kit usa. Stesso host e
// credenziali, cambia solo la porta.
const url = process.env.DATABASE_URL!.replace(":6543/", ":5432/");

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url },
});
