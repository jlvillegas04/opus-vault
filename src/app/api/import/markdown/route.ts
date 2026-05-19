import { db } from "@/lib/db";
import { notes, events, characters, factions, locations, items, plotlines } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import matter from "gray-matter";
import { z } from "zod";

const QuerySchema = z.object({
  overwrite: z.enum(["true", "false"]).optional().default("false"),
});

function extractH1(content: string): string | null {
  const match = content.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : null;
}

function filenameToTitle(filename: string): string {
  return filename.replace(/\.md$/i, "").replace(/[-_]/g, " ");
}

function parseDate(value: unknown): Date | null {
  if (!value) return null;
  const d = new Date(String(value));
  return isNaN(d.getTime()) ? null : d;
}

function str(value: unknown): string | null {
  return value != null && value !== "" ? String(value) : null;
}

function bool(value: unknown): boolean {
  return value === true || value === "true" || value === 1;
}

type ImportResult = {
  file: string;
  status: "imported" | "updated" | "skipped" | "error";
  title?: string;
  id?: string;
  target?: string;
  error?: string;
};

// ── Note ────────────────────────────────────────────────────────────────────

async function importAsNote(filename: string, title: string, content: string, overwrite: boolean): Promise<ImportResult> {
  const existing = await db.select().from(notes).where(eq(notes.sourcePath, filename)).get();
  if (existing) {
    if (!overwrite) return { file: filename, status: "skipped", title: existing.title, id: existing.id, target: "note" };
    await db.update(notes).set({ title, content: content.trim(), updatedAt: new Date() }).where(eq(notes.id, existing.id));
    return { file: filename, status: "updated", title, id: existing.id, target: "note" };
  }
  const id = crypto.randomUUID();
  const now = new Date();
  await db.insert(notes).values({ id, title, content: content.trim(), sourcePath: filename, createdAt: now, updatedAt: now });
  return { file: filename, status: "imported", title, id, target: "note" };
}

// ── Session (Event) ──────────────────────────────────────────────────────────

async function importAsSession(
  filename: string, title: string, content: string,
  fm: Record<string, unknown>, overwrite: boolean,
): Promise<ImportResult> {
  const sessionNumber = fm.session != null ? Number(fm.session) : fm.session_number != null ? Number(fm.session_number) : null;
  const realDate = parseDate(fm.date ?? fm.real_date);
  const eventDate = str(fm.world_date ?? fm.event_date);

  const existing = await db.select().from(events).where(eq(events.sourcePath, filename)).get();
  if (existing) {
    if (!overwrite) return { file: filename, status: "skipped", title: existing.title, id: existing.id, target: "session" };
    await db.update(events)
      .set({ title, description: content.trim(), sessionNumber, realDate, eventDate, updatedAt: new Date() })
      .where(eq(events.id, existing.id));
    return { file: filename, status: "updated", title, id: existing.id, target: "session" };
  }
  const id = crypto.randomUUID();
  const now = new Date();
  await db.insert(events).values({ id, title, description: content.trim(), sessionNumber, realDate, eventDate, sourcePath: filename, createdAt: now, updatedAt: now });
  return { file: filename, status: "imported", title, id, target: "session" };
}

// ── Character ────────────────────────────────────────────────────────────────

const CHARACTER_STATUSES = ["alive", "dead", "missing", "unknown"] as const;

async function importAsCharacter(
  filename: string, name: string, content: string,
  fm: Record<string, unknown>, overwrite: boolean,
): Promise<ImportResult> {
  const rawStatus = str(fm.status);
  const status = CHARACTER_STATUSES.includes(rawStatus as typeof CHARACTER_STATUSES[number])
    ? (rawStatus as typeof CHARACTER_STATUSES[number])
    : "alive";

  const existing = await db.select().from(characters).where(eq(characters.sourcePath, filename)).get();
  if (existing) {
    if (!overwrite) return { file: filename, status: "skipped", title: existing.name, id: existing.id, target: "character" };
    await db.update(characters)
      .set({
        name,
        title: str(fm.title),
        description: content.trim(),
        backstory: str(fm.backstory),
        status,
        isPlayerCharacter: bool(fm.is_player_character ?? fm.isPlayerCharacter),
        arc: str(fm.arc),
        updatedAt: new Date(),
      })
      .where(eq(characters.id, existing.id));
    return { file: filename, status: "updated", title: name, id: existing.id, target: "character" };
  }
  const id = crypto.randomUUID();
  const now = new Date();
  await db.insert(characters).values({
    id,
    name,
    title: str(fm.title),
    description: content.trim(),
    backstory: str(fm.backstory),
    status,
    isPlayerCharacter: bool(fm.is_player_character ?? fm.isPlayerCharacter),
    arc: str(fm.arc),
    sourcePath: filename,
    createdAt: now,
    updatedAt: now,
  });
  return { file: filename, status: "imported", title: name, id, target: "character" };
}

// ── Faction ──────────────────────────────────────────────────────────────────

async function importAsFaction(
  filename: string, name: string, content: string,
  fm: Record<string, unknown>, overwrite: boolean,
): Promise<ImportResult> {
  const existing = await db.select().from(factions).where(eq(factions.sourcePath, filename)).get();
  if (existing) {
    if (!overwrite) return { file: filename, status: "skipped", title: existing.name, id: existing.id, target: "faction" };
    await db.update(factions)
      .set({ name, description: content.trim(), goals: str(fm.goals), alignment: str(fm.alignment), updatedAt: new Date() })
      .where(eq(factions.id, existing.id));
    return { file: filename, status: "updated", title: name, id: existing.id, target: "faction" };
  }
  const id = crypto.randomUUID();
  const now = new Date();
  await db.insert(factions).values({
    id, name, description: content.trim(),
    goals: str(fm.goals), alignment: str(fm.alignment),
    sourcePath: filename, createdAt: now, updatedAt: now,
  });
  return { file: filename, status: "imported", title: name, id, target: "faction" };
}

// ── Location ─────────────────────────────────────────────────────────────────

const LOCATION_TYPES = ["world", "region", "city", "district", "building", "dungeon", "wilderness", "plane", "other"] as const;

async function importAsLocation(
  filename: string, name: string, content: string,
  fm: Record<string, unknown>, overwrite: boolean,
): Promise<ImportResult> {
  const rawType = str(fm.location_type ?? fm.locationType);
  const locationType = LOCATION_TYPES.includes(rawType as typeof LOCATION_TYPES[number])
    ? (rawType as typeof LOCATION_TYPES[number])
    : "other";

  const existing = await db.select().from(locations).where(eq(locations.sourcePath, filename)).get();
  if (existing) {
    if (!overwrite) return { file: filename, status: "skipped", title: existing.name, id: existing.id, target: "location" };
    await db.update(locations)
      .set({ name, description: content.trim(), locationType, updatedAt: new Date() })
      .where(eq(locations.id, existing.id));
    return { file: filename, status: "updated", title: name, id: existing.id, target: "location" };
  }
  const id = crypto.randomUUID();
  const now = new Date();
  await db.insert(locations).values({
    id, name, description: content.trim(), locationType,
    sourcePath: filename, createdAt: now, updatedAt: now,
  });
  return { file: filename, status: "imported", title: name, id, target: "location" };
}

// ── Item ─────────────────────────────────────────────────────────────────────

const RARITIES = ["common", "uncommon", "rare", "very_rare", "legendary", "artifact", "unique"] as const;

async function importAsItem(
  filename: string, name: string, content: string,
  fm: Record<string, unknown>, overwrite: boolean,
): Promise<ImportResult> {
  const rawRarity = str(fm.rarity);
  const rarity = RARITIES.includes(rawRarity as typeof RARITIES[number])
    ? (rawRarity as typeof RARITIES[number])
    : undefined;

  const existing = await db.select().from(items).where(eq(items.sourcePath, filename)).get();
  if (existing) {
    if (!overwrite) return { file: filename, status: "skipped", title: existing.name, id: existing.id, target: "item" };
    await db.update(items)
      .set({ name, description: content.trim(), rarity, properties: str(fm.properties), history: str(fm.history), updatedAt: new Date() })
      .where(eq(items.id, existing.id));
    return { file: filename, status: "updated", title: name, id: existing.id, target: "item" };
  }
  const id = crypto.randomUUID();
  const now = new Date();
  await db.insert(items).values({
    id, name, description: content.trim(),
    rarity, properties: str(fm.properties), history: str(fm.history),
    sourcePath: filename, createdAt: now, updatedAt: now,
  });
  return { file: filename, status: "imported", title: name, id, target: "item" };
}

// ── Plotline ──────────────────────────────────────────────────────────────────

const PLOTLINE_STATUSES = ["active", "resolved", "dormant", "abandoned"] as const;

async function importAsPlotline(
  filename: string, title: string, content: string,
  fm: Record<string, unknown>, overwrite: boolean,
): Promise<ImportResult> {
  const rawStatus = str(fm.status);
  const status = PLOTLINE_STATUSES.includes(rawStatus as typeof PLOTLINE_STATUSES[number])
    ? (rawStatus as typeof PLOTLINE_STATUSES[number])
    : "active";

  const existing = await db.select().from(plotlines).where(eq(plotlines.sourcePath, filename)).get();
  if (existing) {
    if (!overwrite) return { file: filename, status: "skipped", title: existing.title, id: existing.id, target: "plotline" };
    await db.update(plotlines)
      .set({ title, description: content.trim(), status, arc: str(fm.arc), hooks: str(fm.hooks), complications: str(fm.complications), potentialResolutions: str(fm.potential_resolutions ?? fm.potentialResolutions), updatedAt: new Date() })
      .where(eq(plotlines.id, existing.id));
    return { file: filename, status: "updated", title, id: existing.id, target: "plotline" };
  }
  const id = crypto.randomUUID();
  const now = new Date();
  await db.insert(plotlines).values({
    id, title, description: content.trim(), status,
    arc: str(fm.arc),
    hooks: str(fm.hooks),
    complications: str(fm.complications),
    potentialResolutions: str(fm.potential_resolutions ?? fm.potentialResolutions),
    sourcePath: filename, createdAt: now, updatedAt: now,
  });
  return { file: filename, status: "imported", title, id, target: "plotline" };
}

// ── Main handler ─────────────────────────────────────────────────────────────

export async function POST(request: Request) {
  const url = new URL(request.url);
  const query = QuerySchema.safeParse(Object.fromEntries(url.searchParams));
  const overwrite = query.success && query.data.overwrite === "true";

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return Response.json({ error: "Invalid form data" }, { status: 400 });
  }

  const files = formData.getAll("files") as File[];
  if (!files.length) {
    return Response.json({ error: "No files provided" }, { status: 400 });
  }

  const results: ImportResult[] = [];

  for (const file of files) {
    if (!file.name.match(/\.md$/i)) {
      results.push({ file: file.name, status: "error", error: "Not a markdown file" });
      continue;
    }

    let raw: string;
    try {
      raw = await file.text();
    } catch {
      results.push({ file: file.name, status: "error", error: "Failed to read file" });
      continue;
    }

    let parsed: matter.GrayMatterFile<string>;
    try {
      parsed = matter(raw);
    } catch {
      results.push({ file: file.name, status: "error", error: "Failed to parse frontmatter" });
      continue;
    }

    const { data: fm, content } = parsed;

    // Name/title: prefer frontmatter name > frontmatter title > first H1 > filename
    const nameOrTitle =
      (typeof fm.name === "string" ? fm.name.trim() : "") ||
      (typeof fm.title === "string" ? fm.title.trim() : "") ||
      extractH1(content) ||
      filenameToTitle(file.name);

    const type = typeof fm.type === "string" ? fm.type.toLowerCase() : "note";

    try {
      let result: ImportResult;
      switch (type) {
        case "session":
          result = await importAsSession(file.name, nameOrTitle, content, fm, overwrite);
          break;
        case "character":
          result = await importAsCharacter(file.name, nameOrTitle, content, fm, overwrite);
          break;
        case "faction":
          result = await importAsFaction(file.name, nameOrTitle, content, fm, overwrite);
          break;
        case "location":
          result = await importAsLocation(file.name, nameOrTitle, content, fm, overwrite);
          break;
        case "item":
          result = await importAsItem(file.name, nameOrTitle, content, fm, overwrite);
          break;
        case "plotline":
          result = await importAsPlotline(file.name, nameOrTitle, content, fm, overwrite);
          break;
        default:
          result = await importAsNote(file.name, nameOrTitle, content, overwrite);
      }
      results.push(result);
    } catch {
      results.push({ file: file.name, status: "error", error: "Database error" });
    }
  }

  return Response.json({ results });
}
