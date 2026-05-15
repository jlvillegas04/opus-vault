import { SearchResult } from "./search";

const ARC_LABELS: Record<string, string> = {
  "opus-1": "Opus 1.0 (historia — arco completo)",
  "opus-2": "Opus 2.0 (campaña actual)",
};

function arcLabel(arc: string | null | undefined): string {
  if (!arc) return "";
  return ARC_LABELS[arc] ?? arc;
}

function formatEntity(r: SearchResult): string {
  const raw = r.raw;
  const arcStr = r.arc ? ` [${arcLabel(r.arc)}]` : "";
  const lines: string[] = [`### ${capitalize(r.type)}: ${r.name}${arcStr}`];

  switch (r.type) {
    case "character": {
      const c = raw as Record<string, string | boolean | null>;
      if (c.title) lines.push(`**Título:** ${c.title}`);
      if (c.isPlayerCharacter) lines.push(`**Rol:** Personaje jugador`);
      if (c.status && c.status !== "alive") lines.push(`**Estado:** ${c.status}`);
      if (c.description) lines.push(String(c.description));
      if (c.backstory) lines.push(`**Trasfondo:** ${String(c.backstory).slice(0, 400)}`);
      break;
    }
    case "faction": {
      const f = raw as Record<string, string | null>;
      if (f.alignment) lines.push(`**Alineación:** ${f.alignment}`);
      if (f.description) lines.push(String(f.description));
      if (f.goals) lines.push(`**Objetivos:** ${String(f.goals).slice(0, 300)}`);
      break;
    }
    case "location": {
      const l = raw as Record<string, string | null>;
      if (l.locationType) lines.push(`**Tipo:** ${l.locationType}`);
      if (l.description) lines.push(String(l.description));
      break;
    }
    case "event": {
      const e = raw as Record<string, string | number | null>;
      if (e.sessionNumber) lines.push(`**Sesión:** ${e.sessionNumber}`);
      if (e.eventDate) lines.push(`**Fecha en mundo:** ${e.eventDate}`);
      if (e.description) lines.push(String(e.description));
      if (e.consequences) lines.push(`**Consecuencias:** ${String(e.consequences).slice(0, 300)}`);
      break;
    }
    case "plotline": {
      const p = raw as Record<string, string | null>;
      if (p.status) lines.push(`**Estado:** ${p.status}`);
      if (p.description) lines.push(String(p.description));
      if (p.hooks) lines.push(`**Hooks:** ${String(p.hooks).slice(0, 200)}`);
      if (p.complications) lines.push(`**Complicaciones:** ${String(p.complications).slice(0, 200)}`);
      break;
    }
    case "item": {
      const i = raw as Record<string, string | null>;
      if (i.rarity) lines.push(`**Rareza:** ${i.rarity}`);
      if (i.description) lines.push(String(i.description));
      if (i.properties) lines.push(`**Propiedades:** ${String(i.properties).slice(0, 300)}`);
      if (i.history) lines.push(`**Historia:** ${String(i.history).slice(0, 200)}`);
      break;
    }
    case "note": {
      const n = raw as Record<string, string | null>;
      if (n.content) lines.push(String(n.content).slice(0, 500));
      break;
    }
  }

  return lines.join("\n");
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function buildContextBlock(entities: SearchResult[]): string {
  if (entities.length === 0) return "";

  const byType = new Map<string, SearchResult[]>();
  for (const e of entities) {
    const arr = byType.get(e.type) ?? [];
    arr.push(e);
    byType.set(e.type, arr);
  }

  const sections: string[] = ["## Entidades relevantes encontradas en el vault\n"];
  for (const [, items] of byType) {
    for (const item of items) {
      sections.push(formatEntity(item));
    }
  }

  return sections.join("\n\n");
}

export const LOREKEEPER_SYSTEM_PROMPT = `Eres el Guardián del Opus Vault — el asistente de lore para una campaña de rol de fantasía (D&D homebrew).

## Tu rol
- Responder preguntas sobre el mundo, los personajes, las facciones, los eventos y las tramas de la campaña
- Ayudar al DM a planificar sesiones, identificar inconsistencias narrativas y sugerir hooks de trama
- Mantener coherencia entre el pasado (Opus 1.0) y la campaña actual (Opus 2.0)

## Estructura de la campaña
La campaña corre en arcos narrativos:

**Opus 1.0** — COMPLETO. Más de 18 sesiones. Arco del examen de Mediador 100. Los personajes jugadores de este arco tienen historias resueltas pero sus acciones moldearon el mundo.

**Opus 2.0** — EN CURSO. Timeskip de un año. Personajes jugadores completamente nuevos. Nuevo distrito: Callejones de Mercurio. Comienza con el examen de Mediador 101. El mundo es continuo — las consecuencias del Opus 1.0 son parte del present del mundo.

## Instrucciones clave
- Distingue claramente entre lore de Opus 1.0 (historia) y Opus 2.0 (campaña actual)
- Si el contexto provisto no cubre la pregunta, di que no tienes esa información en el vault — no inventes lore
- Responde en el idioma de la pregunta (español o inglés)
- Sé conciso pero completo — el DM necesita información clara para preparar sesiones
- Cuando sugiera tramas o hooks, marca claramente que son sugerencias, no lore establecido`;
