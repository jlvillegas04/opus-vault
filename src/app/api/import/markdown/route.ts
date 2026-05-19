import { db } from "@/lib/db";
import { notes } from "@/lib/db/schema";
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

  const results: Array<{
    file: string;
    status: "imported" | "updated" | "skipped" | "error";
    title?: string;
    id?: string;
    error?: string;
  }> = [];

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

    const { data: frontmatter, content } = parsed;
    const title =
      (typeof frontmatter.title === "string" ? frontmatter.title.trim() : "") ||
      extractH1(content) ||
      filenameToTitle(file.name);

    const existing = await db.select().from(notes).where(eq(notes.sourcePath, file.name)).get();

    if (existing) {
      if (!overwrite) {
        results.push({ file: file.name, status: "skipped", title: existing.title, id: existing.id });
        continue;
      }
      await db.update(notes)
        .set({ title, content: content.trim(), updatedAt: new Date() })
        .where(eq(notes.id, existing.id));
      results.push({ file: file.name, status: "updated", title, id: existing.id });
      continue;
    }

    const id = crypto.randomUUID();
    const now = new Date();
    await db.insert(notes)
      .values({ id, title, content: content.trim(), sourcePath: file.name, createdAt: now, updatedAt: now });
    results.push({ file: file.name, status: "imported", title, id });
  }

  return Response.json({ results });
}
