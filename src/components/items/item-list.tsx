"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Plus, Swords } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { FilterBar, type FilterOption } from "@/components/ui/filter-bar";
import { cn } from "@/lib/utils";
import { ItemForm } from "./item-form";
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

const RARITY_FILTERS: FilterOption[] = [
  { value: "common", label: "Common", className: RARITY_STYLES.common },
  { value: "uncommon", label: "Uncommon", className: RARITY_STYLES.uncommon },
  { value: "rare", label: "Rare", className: RARITY_STYLES.rare },
  { value: "very_rare", label: "Very Rare", className: RARITY_STYLES.very_rare },
  { value: "legendary", label: "Legendary", className: RARITY_STYLES.legendary },
  { value: "artifact", label: "Artifact", className: RARITY_STYLES.artifact },
  { value: "unique", label: "Unique", className: RARITY_STYLES.unique },
];

async function fetchItems(): Promise<Item[]> {
  const res = await fetch("/api/items");
  if (!res.ok) throw new Error("Failed to fetch items");
  return res.json();
}

export function ItemList() {
  const router = useRouter();
  const [newFormOpen, setNewFormOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const { data: items, isLoading } = useQuery({
    queryKey: ["items"],
    queryFn: fetchItems,
  });

  const filtered = useMemo(() => {
    if (!items) return [];
    const q = search.toLowerCase();
    return items.filter((item) => {
      const matchesSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q);
      const matchesFilter = !activeFilter || item.rarity === activeFilter;
      return matchesSearch && matchesFilter;
    });
  }, [items, search, activeFilter]);

  return (
    <div className="space-y-6 p-4 overflow-auto flex-1">
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

      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-36" />
          ))}
        </div>
      )}

      {!isLoading && items && (
        items.length === 0 ? (
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
        ) : (
          <>
            <FilterBar
              search={search}
              onSearchChange={setSearch}
              placeholder="Search items..."
              filters={RARITY_FILTERS}
              activeFilter={activeFilter}
              onFilterChange={setActiveFilter}
            />

            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Swords className="h-10 w-10 text-muted-foreground mb-3" />
                <p className="font-medium">No items match your filters</p>
                <button
                  className="text-sm text-muted-foreground hover:text-foreground mt-1 underline-offset-4 hover:underline"
                  onClick={() => { setSearch(""); setActiveFilter(null); }}
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((item) => (
                  <Card
                    key={item.id}
                    className="flex flex-col cursor-pointer hover:bg-accent/50 transition-colors"
                    onClick={() => router.push(`/items/${item.id}`)}
                  >
                    <CardHeader className="pb-2">
                      <CardTitle className="truncate text-base">{item.name}</CardTitle>
                      {item.rarity && (
                        <CardAction>
                          <Badge variant="outline" className={cn(RARITY_STYLES[item.rarity])}>
                            {RARITY_LABELS[item.rarity] ?? item.rarity}
                          </Badge>
                        </CardAction>
                      )}
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
          </>
        )
      )}

      <ItemForm open={newFormOpen} onOpenChange={setNewFormOpen} />

    </div>
  );
}
