import { db } from "@/lib/db";
import { notes } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";

const CreateSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().optional(),
});

export async function GET() {
  const result = db.select().from(notes).orderBy(desc(notes.updatedAt)).all();
  return Response.json(result);
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = CreateSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues }, { status: 400 });
  }

  const id = crypto.randomUUID();
  const now = new Date();

  db.insert(notes)
    .values({ id, ...parsed.data, createdAt: now, updatedAt: now })
    .run();

  const created = db.select().from(notes).where(eq(notes.id, id)).get();
  return Response.json(created, { status: 201 });
}
