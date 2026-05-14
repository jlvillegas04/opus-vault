import { db } from "@/lib/db";
import { items } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const UpdateSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  properties: z.string().optional(),
  history: z.string().optional(),
  rarity: z
    .enum(["common", "uncommon", "rare", "very_rare", "legendary", "artifact", "unique"])
    .optional(),
});

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteContext) {
  const { id } = await params;
  const item = await db.select().from(items).where(eq(items.id, id)).get();
  if (!item) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(item);
}

export async function PATCH(request: Request, { params }: RouteContext) {
  const { id } = await params;
  const body = await request.json();
  const parsed = UpdateSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues }, { status: 400 });
  }

  const existing = await db.select().from(items).where(eq(items.id, id)).get();
  if (!existing) return Response.json({ error: "Not found" }, { status: 404 });

  await db.update(items)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(items.id, id));

  const updated = await db.select().from(items).where(eq(items.id, id)).get();
  return Response.json(updated);
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const { id } = await params;
  const existing = await db.select().from(items).where(eq(items.id, id)).get();
  if (!existing) return Response.json({ error: "Not found" }, { status: 404 });

  await db.delete(items).where(eq(items.id, id));
  return new Response(null, { status: 204 });
}
