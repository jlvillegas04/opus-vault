/**
 * One-time migration: reads all data from local opus-vault.db and inserts it into Turso.
 * Run with: npx tsx scripts/migrate-to-turso.ts
 *
 * Requires TURSO_DATABASE_URL and TURSO_AUTH_TOKEN in .env.local
 */

import Database from "better-sqlite3";
import { createClient } from "@libsql/client";
import { config } from "dotenv";
import path from "path";

config({ path: ".env.local" });

const TURSO_URL = process.env.TURSO_DATABASE_URL;
const TURSO_TOKEN = process.env.TURSO_AUTH_TOKEN;

if (!TURSO_URL) {
  console.error("❌  TURSO_DATABASE_URL not set in .env.local");
  process.exit(1);
}

const sqlite = new Database(path.join(process.cwd(), "opus-vault.db"));
const turso = createClient({ url: TURSO_URL, authToken: TURSO_TOKEN });

// Order matters — parent tables before child tables (FK constraints)
const TABLES = [
  "characters",
  "factions",
  "locations",
  "events",
  "plotlines",
  "items",
  "notes",
  "character_factions",
  "character_relationships",
  "faction_relationships",
  "character_locations",
  "event_participants",
  "event_locations",
  "plotline_participants",
  "plotline_events",
];

async function migrate() {
  console.log("\n🚀  Starting migration from local SQLite → Turso\n");

  for (const table of TABLES) {
    const rows = sqlite.prepare(`SELECT * FROM ${table}`).all() as Record<string, unknown>[];

    if (rows.length === 0) {
      console.log(`  ⚪  ${table}: empty, skipping`);
      continue;
    }

    const cols = Object.keys(rows[0]);
    const colList = cols.join(", ");
    const placeholders = cols.map(() => "?").join(", ");
    const sql = `INSERT OR IGNORE INTO ${table} (${colList}) VALUES (${placeholders})`;

    let inserted = 0;
    for (const row of rows) {
      const args = cols.map((c) => {
        const v = row[c];
        // libsql accepts null, string, number, ArrayBuffer — no undefined
        return v === undefined ? null : v;
      });
      await turso.execute({ sql, args });
      inserted++;
    }

    console.log(`  ✅  ${table}: ${inserted} rows`);
  }

  console.log("\n✨  Migration complete.\n");
  sqlite.close();
}

migrate().catch((err) => {
  console.error("❌  Migration failed:", err);
  process.exit(1);
});
