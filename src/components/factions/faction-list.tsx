"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
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

  const { data: factions, isLoading } = useQuery({
    queryKey: ["factions"],
    queryFn: fetchFactions,
  });

  return (
    <div className="space-y-6">
      {/* Page header */}
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

      {/* Loading skeletons */}
      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-36" />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && factions?.length === 0 && (
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
      )}

      {/* Faction grid */}
      {!isLoading && factions && factions.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {factions.map((faction) => (
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

      {/* New faction dialog */}
      <FactionForm
        open={newFormOpen}
        onOpenChange={setNewFormOpen}
      />

      {/* Detail / edit sheet */}
      <FactionSheet
        faction={selectedFaction}
        onClose={() => setSelectedFaction(null)}
      />
    </div>
  );
}
