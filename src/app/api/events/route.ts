import { db } from "@/lib/db";
import { events } from "@/lib/db/schema";
import { desc, sql } from "drizzle-orm";
import { z } from "zod";

const CreateSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  sessionNumber: z.number().int().optional(),
  eventDate: z.string().optional(),
  realDate: z.string().optional(), // ISO date string
  consequences: z.string().optional(),
});

export async function GET() {
  const result = db
    .select()
    .from(events)
    .orderBy(sql`${events.sessionNumber} DESC NULLS LAST, ${events.createdAt} DESC`)
    .all();
  return Response.json(result);
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = CreateSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues }, { status: 400 });
  }

  const { realDate, ...rest } = parsed.data;
  const id = crypto.randomUUID();
  const now = new Date();

  db.insert(events)
    .values({
      id,
      ...rest,
      realDate: realDate ? new Date(realDate) : undefined,
      createdAt: now,
      updatedAt: now,
    })
    .run();

  const created = db.select().from(events).where(sql`${events.id} = ${id}`).get();
  return Response.json(created, { status: 201 });
}
