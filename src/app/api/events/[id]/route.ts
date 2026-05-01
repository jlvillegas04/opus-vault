import { db } from "@/lib/db";
import { events } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const UpdateSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  sessionNumber: z.number().int().optional(),
  eventDate: z.string().optional(),
  realDate: z.string().optional(), // ISO date string
  consequences: z.string().optional(),
});

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteContext) {
  const { id } = await params;
  const event = db.select().from(events).where(eq(events.id, id)).get();
  if (!event) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(event);
}

export async function PATCH(request: Request, { params }: RouteContext) {
  const { id } = await params;
  const body = await request.json();
  const parsed = UpdateSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues }, { status: 400 });
  }

  const existing = db.select().from(events).where(eq(events.id, id)).get();
  if (!existing) return Response.json({ error: "Not found" }, { status: 404 });

  const { realDate, ...rest } = parsed.data;
  const updateData: Record<string, unknown> = { ...rest, updatedAt: new Date() };
  if (realDate !== undefined) {
    updateData.realDate = realDate ? new Date(realDate) : null;
  }

  db.update(events).set(updateData).where(eq(events.id, id)).run();

  const updated = db.select().from(events).where(eq(events.id, id)).get();
  return Response.json(updated);
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const { id } = await params;
  const existing = db.select().from(events).where(eq(events.id, id)).get();
  if (!existing) return Response.json({ error: "Not found" }, { status: 404 });

  db.delete(events).where(eq(events.id, id)).run();
  return new Response(null, { status: 204 });
}
