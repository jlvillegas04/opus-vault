import Anthropic from "@anthropic-ai/sdk";
import type { MessageStreamEvent } from "@anthropic-ai/sdk/resources/messages";
import { searchEntities, fetchRecentContext } from "@/lib/lorekeeper/search";
import { buildContextBlock, LOREKEEPER_SYSTEM_PROMPT } from "@/lib/lorekeeper/context";

const anthropic = new Anthropic();

interface Message {
  role: "user" | "assistant";
  content: string;
}

function errorResponse(message: string, status = 500) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function extractErrorMessage(err: unknown): string {
  if (err && typeof err === "object") {
    // Anthropic SDK error shape
    const e = err as Record<string, unknown>;
    if (e.status === 400 && e.error && typeof e.error === "object") {
      const inner = (e.error as Record<string, unknown>).error;
      if (inner && typeof inner === "object") {
        const msg = (inner as Record<string, unknown>).message;
        if (typeof msg === "string") return msg;
      }
    }
    if (typeof e.message === "string") return e.message;
  }
  return "Error desconocido del Lorekeeper.";
}

export async function POST(req: Request) {
  let body: { message?: string; history?: Message[] };
  try {
    body = await req.json();
  } catch {
    return errorResponse("JSON inválido.", 400);
  }

  const { message, history = [] } = body;

  if (!message?.trim()) {
    return errorResponse("Message required", 400);
  }

  // Retrieve relevant entities from the vault
  let entities;
  try {
    entities = await searchEntities(message);
    if (entities.length === 0) {
      entities = await fetchRecentContext();
    }
  } catch (err) {
    console.error("[lorekeeper] DB search error:", err);
    return errorResponse("Error al buscar en el vault. Revisá la conexión a Turso.");
  }

  const contextBlock = buildContextBlock(entities);
  const systemPrompt = contextBlock
    ? `${LOREKEEPER_SYSTEM_PROMPT}\n\n${contextBlock}`
    : LOREKEEPER_SYSTEM_PROMPT;

  const recentHistory = history.slice(-10);

  // messages.create({ stream: true }) awaits the initial HTTP response, so
  // auth/billing errors throw here before we commit to a 200 Response.
  let streamResponse: AsyncIterable<MessageStreamEvent>;
  try {
    streamResponse = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      stream: true,
      system: systemPrompt,
      messages: [
        ...recentHistory.map((m) => ({ role: m.role, content: m.content })),
        { role: "user", content: message },
      ],
    });
  } catch (err) {
    console.error("[lorekeeper] Anthropic error:", err);
    return errorResponse(extractErrorMessage(err));
  }

  const readable = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      try {
        for await (const event of streamResponse) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
      } catch (err) {
        console.error("[lorekeeper] Stream error:", err);
        controller.error(err);
      } finally {
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "no-cache",
    },
  });
}
