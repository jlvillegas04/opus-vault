import { db } from "@/lib/db";
import { characters } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const UpdateSchema = z.object({
  name: z.string().min(1).optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  backstory: z.string().optional(),
  status: z.enum(["alive", "dead", "missing", "unknown"]).optional(),
  isPlayerCharacter: z.boolean().optional(),
  arc: z.string().nullable().optional(),
});

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteContext) {
  const { id } = await params;
  const character = await db.select().from(characters).where(eq(characters.id, id)).get();
  if (!character) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(character);
}

export async function PATCH(request: Request, { params }: RouteContext) {
  const { id } = await params;
  const body = await request.json();
  const parsed = UpdateSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues }, { status: 400 });
  }

  const existing = await db.select().from(characters).where(eq(characters.id, id)).get();
  if (!existing) return Response.json({ error: "Not found" }, { status: 404 });

  await db.update(characters)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(characters.id, id));

  const updated = await db.select().from(characters).where(eq(characters.id, id)).get();
  return Response.json(updated);
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const { id } = await params;
  const existing = await db.select().from(characters).where(eq(characters.id, id)).get();
  if (!existing) return Response.json({ error: "Not found" }, { status: 404 });

  await db.delete(characters).where(eq(characters.id, id));
  return new Response(null, { status: 204 });
}
