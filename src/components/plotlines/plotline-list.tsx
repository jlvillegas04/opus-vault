"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Plus, GitBranch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { FilterBar, type FilterOption } from "@/components/ui/filter-bar";
import { cn } from "@/lib/utils";
import { PlotlineForm } from "./plotline-form";
import type { Plotline } from "@/lib/db/schema";

const STATUS_STYLES: Record<string, string> = {
  active: "bg-green-500/15 text-green-400 border-green-500/20",
  resolved: "bg-blue-500/15 text-blue-400 border-blue-500/20",
  dormant: "bg-yellow-500/15 text-yellow-400 border-yellow-500/20",
  abandoned: "bg-muted text-muted-foreground",
};

const STATUS_FILTERS: FilterOption[] = [
  { value: "active",   label: "Active",   className: STATUS_STYLES.active },
  { value: "resolved", label: "Resolved", className: STATUS_STYLES.resolved },
  { value: "dormant",  label: "Dormant",  className: STATUS_STYLES.dormant },
  { value: "abandoned",label: "Abandoned",className: STATUS_STYLES.abandoned },
];

async function fetchPlotlines(): Promise<Plotline[]> {
  const res = await fetch("/api/plotlines");
  if (!res.ok) throw new Error("Failed to fetch plotlines");
  return res.json();
}

export function PlotlineList() {
  const router = useRouter();
  const [newFormOpen, setNewFormOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const { data: plotlines, isLoading } = useQuery({
    queryKey: ["plotlines"],
    queryFn: fetchPlotlines,
  });

  const filtered = useMemo(() => {
    if (!plotlines) return [];
    const q = search.toLowerCase();
    return plotlines.filter((p) => {
      const matchesSearch =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q);
      const matchesFilter = !activeFilter || (p.status ?? "active") === activeFilter;
      return matchesSearch && matchesFilter;
    });
  }, [plotlines, search, activeFilter]);

  return (
    <div className="space-y-6 p-4 overflow-auto flex-1">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Plotlines</h1>
          <p className="text-muted-foreground mt-1">Story arcs and quest threads</p>
        </div>
        <Button onClick={() => setNewFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Plotline
        </Button>
      </div>

      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-36" />
          ))}
        </div>
      )}

      {!isLoading && plotlines && (
        plotlines.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <GitBranch className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-medium text-lg">No plotlines yet</h3>
            <p className="text-muted-foreground text-sm mt-1 mb-4">
              Track the story arcs and quest threads weaving through your campaign.
            </p>
            <Button onClick={() => setNewFormOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add your first plotline
            </Button>
          </div>
        ) : (
          <>
            <FilterBar
              search={search}
              onSearchChange={setSearch}
              placeholder="Search plotlines..."
              filters={STATUS_FILTERS}
              activeFilter={activeFilter}
              onFilterChange={setActiveFilter}
            />

            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <GitBranch className="h-10 w-10 text-muted-foreground mb-3" />
                <p className="font-medium">No plotlines match your filters</p>
                <button
                  className="text-sm text-muted-foreground hover:text-foreground mt-1 underline-offset-4 hover:underline"
                  onClick={() => { setSearch(""); setActiveFilter(null); }}
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((plotline) => (
                  <Card
                    key={plotline.id}
                    className="flex flex-col cursor-pointer hover:bg-accent/50 transition-colors"
                    onClick={() => router.push(`/plotlines/${plotline.id}`)}
                  >
                    <CardHeader className="pb-2">
                      <CardTitle className="truncate text-base">{plotline.title}</CardTitle>
                      <CardAction>
                        <Badge
                          variant="outline"
                          className={cn("capitalize", STATUS_STYLES[plotline.status ?? "active"])}
                        >
                          {plotline.status ?? "active"}
                        </Badge>
                      </CardAction>
                    </CardHeader>

                    {plotline.description && (
                      <CardContent className="pb-4 flex-1">
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {plotline.description}
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

      <PlotlineForm open={newFormOpen} onOpenChange={setNewFormOpen} />

    </div>
  );
}
