"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Swords } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { ItemForm } from "./item-form";
import { ItemSheet } from "./item-sheet";
import type { Item } from "@/lib/db/schema";

const RARITY_STYLES: Record<string, string> = {
  common: "bg-muted text-muted-foreground",
  uncommon: "bg-green-500/15 text-green-400 border-green-500/20",
  rare: "bg-blue-500/15 text-blue-400 border-blue-500/20",
  very_rare: "bg-purple-500/15 text-purple-400 border-purple-500/20",
  legendary: "bg-orange-500/15 text-orange-400 border-orange-500/20",
  artifact: "bg-red-500/15 text-red-400 border-red-500/20",
  unique: "bg-yellow-500/15 text-yellow-400 border-yellow-500/20",
};

const RARITY_LABELS: Record<string, string> = {
  common: "Common",
  uncommon: "Uncommon",
  rare: "Rare",
  very_rare: "Very Rare",
  legendary: "Legendary",
  artifact: "Artifact",
  unique: "Unique",
};

async function fetchItems(): Promise<Item[]> {
  const res = await fetch("/api/items");
  if (!res.ok) throw new Error("Failed to fetch items");
  return res.json();
}

export function ItemList() {
  const [newFormOpen, setNewFormOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  const { data: items, isLoading } = useQuery({
    queryKey: ["items"],
    queryFn: fetchItems,
  });

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Items</h1>
          <p className="text-muted-foreground mt-1">Magic items and artifacts in your campaign</p>
        </div>
        <Button onClick={() => setNewFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Item
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
      {!isLoading && items?.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Swords className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="font-medium text-lg">No items yet</h3>
          <p className="text-muted-foreground text-sm mt-1 mb-4">
            Add the magic items and artifacts your campaign features.
          </p>
          <Button onClick={() => setNewFormOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add your first item
          </Button>
        </div>
      )}

      {/* Item grid — each card opens the detail sheet */}
      {!isLoading && items && items.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <Card
              key={item.id}
              className="flex flex-col cursor-pointer hover:bg-accent/50 transition-colors"
              onClick={() => setSelectedItem(item)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <CardTitle className="truncate text-base">{item.name}</CardTitle>
                  </div>
                  {item.rarity && (
                    <Badge
                      variant="outline"
                      className={cn("shrink-0", RARITY_STYLES[item.rarity])}
                    >
                      {RARITY_LABELS[item.rarity] ?? item.rarity}
                    </Badge>
                  )}
                </div>
              </CardHeader>

              {item.description && (
                <CardContent className="pb-4 flex-1">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {item.description}
                  </p>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* New item dialog */}
      <ItemForm open={newFormOpen} onOpenChange={setNewFormOpen} />

      {/* Detail / edit sheet */}
      <ItemSheet item={selectedItem} onClose={() => setSelectedItem(null)} />
    </div>
  );
}
