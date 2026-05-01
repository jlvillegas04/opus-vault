import { db } from "@/lib/db";
import { items } from "@/lib/db/schema";
import { asc, eq } from "drizzle-orm";
import { z } from "zod";

const CreateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  properties: z.string().optional(),
  history: z.string().optional(),
  rarity: z
    .enum(["common", "uncommon", "rare", "very_rare", "legendary", "artifact", "unique"])
    .optional(),
});

export async function GET() {
  const result = db.select().from(items).orderBy(asc(items.name)).all();
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

  db.insert(items)
    .values({ id, ...parsed.data, createdAt: now, updatedAt: now })
    .run();

  const created = db.select().from(items).where(eq(items.id, id)).get();
  return Response.json(created, { status: 201 });
}
