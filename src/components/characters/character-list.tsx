"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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

async function fetchCharacters(): Promise<Character[]> {
  const res = await fetch("/api/characters");
  if (!res.ok) throw new Error("Failed to fetch characters");
  return res.json();
}

export function CharacterList() {
  const [newFormOpen, setNewFormOpen] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);

  const { data: characters, isLoading } = useQuery({
    queryKey: ["characters"],
    queryFn: fetchCharacters,
  });

  return (
    <div className="space-y-6">
      {/* Page header */}
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

      {/* Loading skeletons */}
      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-36" />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && characters?.length === 0 && (
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
      )}

      {/* Character grid — each card opens the detail sheet */}
      {!isLoading && characters && characters.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {characters.map((character) => (
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

      {/* New character dialog */}
      <CharacterForm
        open={newFormOpen}
        onOpenChange={setNewFormOpen}
        character={null}
      />

      {/* Detail / edit sheet */}
      <CharacterSheet
        character={selectedCharacter}
        onClose={() => setSelectedCharacter(null)}
      />
    </div>
  );
}
