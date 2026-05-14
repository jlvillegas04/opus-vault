import { db } from "@/lib/db";
import { locations } from "@/lib/db/schema";
import { asc, eq } from "drizzle-orm";
import { z } from "zod";

const CreateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  locationType: z.enum(["world", "region", "city", "district", "building", "dungeon", "wilderness", "plane", "other"]).optional(),
  parentLocationId: z.string().optional(),
});

export async function GET() {
  const result = await db.select().from(locations).orderBy(asc(locations.name));
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

  await db.insert(locations)
    .values({ id, ...parsed.data, createdAt: now, updatedAt: now });

  const created = await db.select().from(locations).where(eq(locations.id, id)).get();
  return Response.json(created, { status: 201 });
}
