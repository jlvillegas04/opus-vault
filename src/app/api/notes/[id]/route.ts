import { db } from "@/lib/db";
import { notes } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const UpdateSchema = z.object({
  title: z.string().min(1).optional(),
  content: z.string().optional(),
});

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteContext) {
  const { id } = await params;
  const note = db.select().from(notes).where(eq(notes.id, id)).get();
  if (!note) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(note);
}

export async function PATCH(request: Request, { params }: RouteContext) {
  const { id } = await params;
  const body = await request.json();
  const parsed = UpdateSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues }, { status: 400 });
  }

  const existing = db.select().from(notes).where(eq(notes.id, id)).get();
  if (!existing) return Response.json({ error: "Not found" }, { status: 404 });

  db.update(notes)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(notes.id, id))
    .run();

  const updated = db.select().from(notes).where(eq(notes.id, id)).get();
  return Response.json(updated);
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const { id } = await params;
  const existing = db.select().from(notes).where(eq(notes.id, id)).get();
  if (!existing) return Response.json({ error: "Not found" }, { status: 404 });

  db.delete(notes).where(eq(notes.id, id)).run();
  return new Response(null, { status: 204 });
}
