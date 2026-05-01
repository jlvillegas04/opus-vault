import { db } from "@/lib/db";
import { factions } from "@/lib/db/schema";
import { asc, eq } from "drizzle-orm";
import { z } from "zod";

const CreateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  goals: z.string().optional(),
  alignment: z.string().optional(),
});

export async function GET() {
  const result = db.select().from(factions).orderBy(asc(factions.name)).all();
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

  db.insert(factions)
    .values({ id, ...parsed.data, createdAt: now, updatedAt: now })
    .run();

  const created = db.select().from(factions).where(eq(factions.id, id)).get();
  return Response.json(created, { status: 201 });
}
