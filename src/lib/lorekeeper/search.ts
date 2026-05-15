import { or, like, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  characters,
  factions,
  locations,
  events,
  plotlines,
  items,
  notes,
} from "@/lib/db/schema";

export interface SearchResult {
  type: "character" | "faction" | "location" | "event" | "plotline" | "item" | "note";
  id: string;
  name: string;
  arc?: string | null;
  snippet: string;
  raw: Record<string, unknown>;
}

function extractKeywords(query: string): string[] {
  const stopWords = new Set([
    "el", "la", "los", "las", "un", "una", "de", "del", "en", "con", "que",
    "the", "a", "an", "of", "in", "on", "at", "to", "for", "is", "are",
    "was", "were", "what", "who", "how", "when", "where", "and", "or",
    "se", "su", "sus", "es", "le", "les", "por", "para", "como", "pero",
    "y", "o", "si", "no", "me", "te", "nos",
  ]);
  return query
    .toLowerCase()
    .split(/[\s,.\-!?;:()[\]{}'"]+/)
    .filter((w) => w.length >= 3 && !stopWords.has(w));
}

function buildLikeConditions(
  keywords: string[],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  columns: any[]
) {
  if (keywords.length === 0 || columns.length === 0) return undefined;
  const conditions = keywords.flatMap((kw) =>
    columns.map((col) => like(col, `%${kw}%`))
  );
  return or(...conditions);
}

export async function searchEntities(query: string): Promise<SearchResult[]> {
  const keywords = extractKeywords(query);
  if (keywords.length === 0) return [];

  const results: SearchResult[] = [];

  // Characters
  const charCondition = buildLikeConditions(keywords, [
    characters.name,
    characters.description,
    characters.backstory,
    characters.title,
  ]);
  if (charCondition) {
    const chars = await db
      .select()
      .from(characters)
      .where(charCondition)
      .limit(8);
    for (const c of chars) {
      results.push({
        type: "character",
        id: c.id,
        name: c.name,
        arc: c.arc,
        snippet: [c.title, c.description].filter(Boolean).join(" — ").slice(0, 200),
        raw: c as Record<string, unknown>,
      });
    }
  }

  // Factions
  const factionCondition = buildLikeConditions(keywords, [
    factions.name,
    factions.description,
    factions.goals,
  ]);
  if (factionCondition) {
    const facs = await db
      .select()
      .from(factions)
      .where(factionCondition)
      .limit(5);
    for (const f of facs) {
      results.push({
        type: "faction",
        id: f.id,
        name: f.name,
        arc: null,
        snippet: f.description?.slice(0, 200) ?? "",
        raw: f as Record<string, unknown>,
      });
    }
  }

  // Locations
  const locCondition = buildLikeConditions(keywords, [
    locations.name,
    locations.description,
  ]);
  if (locCondition) {
    const locs = await db
      .select()
      .from(locations)
      .where(locCondition)
      .limit(5);
    for (const l of locs) {
      results.push({
        type: "location",
        id: l.id,
        name: l.name,
        arc: null,
        snippet: l.description?.slice(0, 200) ?? "",
        raw: l as Record<string, unknown>,
      });
    }
  }

  // Events
  const eventCondition = buildLikeConditions(keywords, [
    events.title,
    events.description,
    events.consequences,
  ]);
  if (eventCondition) {
    const evs = await db
      .select()
      .from(events)
      .where(eventCondition)
      .limit(6);
    for (const e of evs) {
      results.push({
        type: "event",
        id: e.id,
        name: e.title,
        arc: null,
        snippet: [e.description, e.consequences].filter(Boolean).join(" | ").slice(0, 200),
        raw: e as Record<string, unknown>,
      });
    }
  }

  // Plotlines
  const plotCondition = buildLikeConditions(keywords, [
    plotlines.title,
    plotlines.description,
    plotlines.hooks,
    plotlines.complications,
  ]);
  if (plotCondition) {
    const plots = await db
      .select()
      .from(plotlines)
      .where(plotCondition)
      .limit(5);
    for (const p of plots) {
      results.push({
        type: "plotline",
        id: p.id,
        name: p.title,
        arc: p.arc,
        snippet: p.description?.slice(0, 200) ?? "",
        raw: p as Record<string, unknown>,
      });
    }
  }

  // Items
  const itemCondition = buildLikeConditions(keywords, [
    items.name,
    items.description,
    items.properties,
    items.history,
  ]);
  if (itemCondition) {
    const its = await db
      .select()
      .from(items)
      .where(itemCondition)
      .limit(5);
    for (const i of its) {
      results.push({
        type: "item",
        id: i.id,
        name: i.name,
        arc: null,
        snippet: [i.description, i.properties].filter(Boolean).join(" — ").slice(0, 200),
        raw: i as Record<string, unknown>,
      });
    }
  }

  // Notes — search title + content
  const noteCondition = buildLikeConditions(keywords, [
    notes.title,
    notes.content,
  ]);
  if (noteCondition) {
    const ns = await db
      .select({ id: notes.id, title: notes.title, content: notes.content })
      .from(notes)
      .where(noteCondition)
      .limit(4);
    for (const n of ns) {
      results.push({
        type: "note",
        id: n.id,
        name: n.title,
        arc: null,
        snippet: n.content?.slice(0, 200) ?? "",
        raw: n as Record<string, unknown>,
      });
    }
  }

  return deduplicateByRelevance(results, keywords);
}

function deduplicateByRelevance(results: SearchResult[], keywords: string[]): SearchResult[] {
  const seen = new Set<string>();
  const scored = results
    .filter((r) => {
      if (seen.has(r.id)) return false;
      seen.add(r.id);
      return true;
    })
    .map((r) => {
      const text = `${r.name} ${r.snippet}`.toLowerCase();
      const score = keywords.reduce((acc, kw) => acc + (text.includes(kw) ? 1 : 0), 0);
      return { r, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 20)
    .map(({ r }) => r);

  return scored;
}

// Fetch a broad context dump when no specific entities match
export async function fetchRecentContext(): Promise<SearchResult[]> {
  const [recentEvents, activeplotlines] = await Promise.all([
    db.select().from(events).orderBy(sql`session_number DESC`).limit(5),
    db.select().from(plotlines).where(
      or(like(plotlines.status, "active"), like(plotlines.status, "dormant"))
    ).limit(5),
  ]);

  const results: SearchResult[] = [
    ...recentEvents.map((e) => ({
      type: "event" as const,
      id: e.id,
      name: e.title,
      arc: null,
      snippet: e.description?.slice(0, 200) ?? "",
      raw: e as Record<string, unknown>,
    })),
    ...activeplotlines.map((p) => ({
      type: "plotline" as const,
      id: p.id,
      name: p.title,
      arc: p.arc,
      snippet: p.description?.slice(0, 200) ?? "",
      raw: p as Record<string, unknown>,
    })),
  ];

  return results;
}
