import { db } from "@/lib/db";
import { plotlines } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const UpdateSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  status: z.enum(["active", "resolved", "dormant", "abandoned"]).optional(),
  hooks: z.string().optional(),
  complications: z.string().optional(),
  potentialResolutions: z.string().optional(),
});

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteContext) {
  const { id } = await params;
  const plotline = db.select().from(plotlines).where(eq(plotlines.id, id)).get();
  if (!plotline) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(plotline);
}

export async function PATCH(request: Request, { params }: RouteContext) {
  const { id } = await params;
  const body = await request.json();
  const parsed = UpdateSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues }, { status: 400 });
  }

  const existing = db.select().from(plotlines).where(eq(plotlines.id, id)).get();
  if (!existing) return Response.json({ error: "Not found" }, { status: 404 });

  db.update(plotlines)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(plotlines.id, id))
    .run();

  const updated = db.select().from(plotlines).where(eq(plotlines.id, id)).get();
  return Response.json(updated);
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const { id } = await params;
  const existing = db.select().from(plotlines).where(eq(plotlines.id, id)).get();
  if (!existing) return Response.json({ error: "Not found" }, { status: 404 });

  db.delete(plotlines).where(eq(plotlines.id, id)).run();
  return new Response(null, { status: 204 });
}
