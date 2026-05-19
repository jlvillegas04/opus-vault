"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { FilterBar, type FilterOption } from "@/components/ui/filter-bar";
import { cn } from "@/lib/utils";
import { CharacterForm } from "./character-form";
import { CharacterSheet } from "./character-sheet";
import type { Character } from "@/lib/db/schema";

const STATUS_STYLES: Record<string, string> = {
  alive: "bg-green-500/15 text-green-400 border-green-500/20",
  dead: "bg-red-500/15 text-red-400 border-red-500/20",
  missing: "bg-yellow-500/15 text-yellow-400 border-yellow-500/20",
  unknown: "bg-muted text-muted-foreground",
};

const STATUS_FILTERS: FilterOption[] = [
  { value: "alive", label: "Alive", className: STATUS_STYLES.alive },
  { value: "dead", label: "Dead", className: STATUS_STYLES.dead },
  { value: "missing", label: "Missing", className: STATUS_STYLES.missing },
  { value: "unknown", label: "Unknown", className: STATUS_STYLES.unknown },
];

async function fetchCharacters(): Promise<Character[]> {
  const res = await fetch("/api/characters");
  if (!res.ok) throw new Error("Failed to fetch characters");
  return res.json();
}

export function CharacterList() {
  const [newFormOpen, setNewFormOpen] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const { data: characters, isLoading } = useQuery({
    queryKey: ["characters"],
    queryFn: fetchCharacters,
  });

  const filtered = useMemo(() => {
    if (!characters) return [];
    const q = search.toLowerCase();
    return characters.filter((c) => {
      const matchesSearch =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.title?.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q);
      const matchesFilter = !activeFilter || (c.status ?? "unknown") === activeFilter;
      return matchesSearch && matchesFilter;
    });
  }, [characters, search, activeFilter]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Characters</h1>
          <p className="text-muted-foreground mt-1">NPCs and PCs in your campaign</p>
        </div>
        <Button onClick={() => setNewFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Character
        </Button>
      </div>

      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-36" />
          ))}
        </div>
      )}

      {!isLoading && characters && (
        characters.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-medium text-lg">No characters yet</h3>
            <p className="text-muted-foreground text-sm mt-1 mb-4">
              Add the NPCs and PCs your campaign revolves around.
            </p>
            <Button onClick={() => setNewFormOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add your first character
            </Button>
          </div>
        ) : (
          <>
            <FilterBar
              search={search}
              onSearchChange={setSearch}
              placeholder="Search characters..."
              filters={STATUS_FILTERS}
              activeFilter={activeFilter}
              onFilterChange={setActiveFilter}
            />

            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Users className="h-10 w-10 text-muted-foreground mb-3" />
                <p className="font-medium">No characters match your filters</p>
                <button
                  className="text-sm text-muted-foreground hover:text-foreground mt-1 underline-offset-4 hover:underline"
                  onClick={() => { setSearch(""); setActiveFilter(null); }}
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((character) => (
                  <Card
                    key={character.id}
                    className="flex flex-col cursor-pointer hover:bg-accent/50 transition-colors"
                    onClick={() => setSelectedCharacter(character)}
                  >
                    <CardHeader className="pb-2">
                      <CardTitle className="truncate text-base">{character.name}</CardTitle>
                      {character.title && (
                        <CardDescription className="truncate">{character.title}</CardDescription>
                      )}
                      <CardAction>
                        <Badge
                          variant="outline"
                          className={cn("capitalize", STATUS_STYLES[character.status ?? "unknown"])}
                        >
                          {character.status ?? "unknown"}
                        </Badge>
                      </CardAction>
                    </CardHeader>

                    {character.description && (
                      <CardContent className="pb-4 flex-1">
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {character.description}
                        </p>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </>
        )
      )}

      <CharacterForm
        open={newFormOpen}
        onOpenChange={setNewFormOpen}
        character={null}
      />

      <CharacterSheet
        character={selectedCharacter}
        onClose={() => setSelectedCharacter(null)}
      />
    </div>
  );
}
