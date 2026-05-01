import { db } from "@/lib/db";
import { factions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const UpdateSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  goals: z.string().optional(),
  alignment: z.string().optional(),
});

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteContext) {
  const { id } = await params;
  const faction = db.select().from(factions).where(eq(factions.id, id)).get();
  if (!faction) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(faction);
}

export async function PATCH(request: Request, { params }: RouteContext) {
  const { id } = await params;
  const body = await request.json();
  const parsed = UpdateSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues }, { status: 400 });
  }

  const existing = db.select().from(factions).where(eq(factions.id, id)).get();
  if (!existing) return Response.json({ error: "Not found" }, { status: 404 });

  db.update(factions)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(factions.id, id))
    .run();

  const updated = db.select().from(factions).where(eq(factions.id, id)).get();
  return Response.json(updated);
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const { id } = await params;
  const existing = db.select().from(factions).where(eq(factions.id, id)).get();
  if (!existing) return Response.json({ error: "Not found" }, { status: 404 });

  db.delete(factions).where(eq(factions.id, id)).run();
  return new Response(null, { status: 204 });
}
