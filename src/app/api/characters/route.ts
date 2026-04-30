import { db } from "@/lib/db";
import { characters } from "@/lib/db/schema";
import { asc, eq } from "drizzle-orm";
import { z } from "zod";

const CreateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  title: z.string().optional(),
  description: z.string().optional(),
  backstory: z.string().optional(),
  status: z.enum(["alive", "dead", "missing", "unknown"]).optional(),
});

export async function GET() {
  const result = db.select().from(characters).orderBy(asc(characters.name)).all();
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

  db.insert(characters)
    .values({ id, ...parsed.data, createdAt: now, updatedAt: now })
    .run();

  const created = db.select().from(characters).where(eq(characters.id, id)).get();
  return Response.json(created, { status: 201 });
}
