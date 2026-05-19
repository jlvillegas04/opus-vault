"use client";

import { MarkdownDropzone } from "@/components/import/markdown-dropzone";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const TYPES = [
  {
    value: "note",
    label: "Note",
    target: "Notes",
    fields: null,
    extra: "No frontmatter needed — just drop the file.",
  },
  {
    value: "session",
    label: "Session",
    target: "Events",
    fields: `---
type: session
session: 20
date: 2025-05-18
world_date: "Día 45, Tercer Mes"
---`,
    extra: null,
  },
  {
    value: "character",
    label: "Character",
    target: "Characters",
    fields: `---
type: character
status: alive
is_player_character: false
arc: opus-2
---`,
    extra: null,
  },
  {
    value: "faction",
    label: "Faction",
    target: "Factions",
    fields: `---
type: faction
alignment: "Lawful Evil"
---`,
    extra: null,
  },
  {
    value: "location",
    label: "Location",
    target: "Locations",
    fields: `---
type: location
location_type: district
---`,
    extra: "location_type: world · region · city · district · building · dungeon · wilderness · plane · other",
  },
  {
    value: "item",
    label: "Item",
    target: "Items",
    fields: `---
type: item
rarity: rare
properties: "deals 1d8 fire damage"
---`,
    extra: "rarity: common · uncommon · rare · very_rare · legendary · artifact · unique",
  },
  {
    value: "plotline",
    label: "Plotline",
    target: "Plotlines",
    fields: `---
type: plotline
status: active
arc: opus-2
---`,
    extra: "status: active · resolved · dormant · abandoned",
  },
];

export default function ImportPage() {
  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6 overflow-auto flex-1">
      <div>
        <h1 className="text-2xl font-bold">Import Markdown</h1>
        <p className="text-muted-foreground mt-1">
          The frontmatter <code className="text-xs bg-muted px-1 py-0.5 rounded">type</code> field
          controls which table the file is imported into. The file body becomes the description.
        </p>
      </div>

      <Tabs defaultValue="note">
        <TabsList className="flex-wrap h-auto gap-1">
          {TYPES.map((t) => (
            <TabsTrigger key={t.value} value={t.value}>
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {TYPES.map((t) => (
          <TabsContent key={t.value} value={t.value}>
            <div className="rounded-lg border bg-muted/30 p-4 space-y-3 text-sm">
              <p className="text-muted-foreground">
                Imports into <span className="text-foreground font-medium">{t.target}</span>.
              </p>
              {t.fields ? (
                <pre className="text-xs bg-muted rounded p-3 leading-relaxed overflow-x-auto">
                  {t.fields}
                </pre>
              ) : null}
              {t.extra ? (
                <p className="text-xs text-muted-foreground">{t.extra}</p>
              ) : null}
              <p className="text-xs text-muted-foreground">
                Title is read from <code className="bg-muted px-1 rounded">name:</code> or{" "}
                <code className="bg-muted px-1 rounded">title:</code>, then the first H1, then the
                filename.
              </p>
            </div>
          </TabsContent>
        ))}
      </Tabs>

      <MarkdownDropzone />
    </div>
  );
}
