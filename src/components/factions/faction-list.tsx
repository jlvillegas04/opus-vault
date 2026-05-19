"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { FilterBar } from "@/components/ui/filter-bar";
import { FactionForm } from "./faction-form";
import { FactionSheet } from "./faction-sheet";
import type { Faction } from "@/lib/db/schema";

async function fetchFactions(): Promise<Faction[]> {
  const res = await fetch("/api/factions");
  if (!res.ok) throw new Error("Failed to fetch factions");
  return res.json();
}

export function FactionList() {
  const [newFormOpen, setNewFormOpen] = useState(false);
  const [selectedFaction, setSelectedFaction] = useState<Faction | null>(null);
  const [search, setSearch] = useState("");

  const { data: factions, isLoading } = useQuery({
    queryKey: ["factions"],
    queryFn: fetchFactions,
  });

  const filtered = useMemo(() => {
    if (!factions) return [];
    const q = search.toLowerCase();
    return factions.filter((f) =>
      !q ||
      f.name.toLowerCase().includes(q) ||
      f.alignment?.toLowerCase().includes(q) ||
      f.description?.toLowerCase().includes(q)
    );
  }, [factions, search]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Factions</h1>
          <p className="text-muted-foreground mt-1">Organizations, guilds, and kingdoms in your campaign</p>
        </div>
        <Button onClick={() => setNewFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Faction
        </Button>
      </div>

      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-36" />
          ))}
        </div>
      )}

      {!isLoading && factions && (
        factions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Shield className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-medium text-lg">No factions yet</h3>
            <p className="text-muted-foreground text-sm mt-1 mb-4">
              Add the organizations and factions that shape your world.
            </p>
            <Button onClick={() => setNewFormOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add your first faction
            </Button>
          </div>
        ) : (
          <>
            <FilterBar
              search={search}
              onSearchChange={setSearch}
              placeholder="Search factions..."
            />

            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Shield className="h-10 w-10 text-muted-foreground mb-3" />
                <p className="font-medium">No factions match your search</p>
                <button
                  className="text-sm text-muted-foreground hover:text-foreground mt-1 underline-offset-4 hover:underline"
                  onClick={() => setSearch("")}
                >
                  Clear search
                </button>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((faction) => (
                  <Card
                    key={faction.id}
                    className="flex flex-col cursor-pointer hover:bg-accent/50 transition-colors"
                    onClick={() => setSelectedFaction(faction)}
                  >
                    <CardHeader className="pb-2">
                      <div className="min-w-0">
                        <CardTitle className="truncate text-base">{faction.name}</CardTitle>
                        {faction.alignment && (
                          <p className="text-xs text-muted-foreground truncate mt-0.5">
                            {faction.alignment}
                          </p>
                        )}
                      </div>
                    </CardHeader>

                    {faction.description && (
                      <CardContent className="pb-4 flex-1">
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {faction.description}
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

      <FactionForm open={newFormOpen} onOpenChange={setNewFormOpen} />

      <FactionSheet faction={selectedFaction} onClose={() => setSelectedFaction(null)} />
    </div>
  );
}
