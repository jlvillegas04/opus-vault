import { db } from "@/lib/db";
import { locations } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const UpdateSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  locationType: z.enum(["world", "region", "city", "district", "building", "dungeon", "wilderness", "plane", "other"]).optional(),
  parentLocationId: z.string().optional().nullable(),
});

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteContext) {
  const { id } = await params;
  const location = db.select().from(locations).where(eq(locations.id, id)).get();
  if (!location) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(location);
}

export async function PATCH(request: Request, { params }: RouteContext) {
  const { id } = await params;
  const body = await request.json();
  const parsed = UpdateSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues }, { status: 400 });
  }

  const existing = db.select().from(locations).where(eq(locations.id, id)).get();
  if (!existing) return Response.json({ error: "Not found" }, { status: 404 });

  db.update(locations)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(locations.id, id))
    .run();

  const updated = db.select().from(locations).where(eq(locations.id, id)).get();
  return Response.json(updated);
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const { id } = await params;
  const existing = db.select().from(locations).where(eq(locations.id, id)).get();
  if (!existing) return Response.json({ error: "Not found" }, { status: 404 });

  db.delete(locations).where(eq(locations.id, id)).run();
  return new Response(null, { status: 204 });
}
