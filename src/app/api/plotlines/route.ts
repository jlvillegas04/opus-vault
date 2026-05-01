import { db } from "@/lib/db";
import { plotlines } from "@/lib/db/schema";
import { asc, eq } from "drizzle-orm";
import { z } from "zod";

const CreateSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  status: z.enum(["active", "resolved", "dormant", "abandoned"]).optional(),
  hooks: z.string().optional(),
  complications: z.string().optional(),
  potentialResolutions: z.string().optional(),
});

export async function GET() {
  const result = db.select().from(plotlines).orderBy(asc(plotlines.title)).all();
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

  db.insert(plotlines)
    .values({ id, ...parsed.data, createdAt: now, updatedAt: now })
    .run();

  const created = db.select().from(plotlines).where(eq(plotlines.id, id)).get();
  return Response.json(created, { status: 201 });
}
