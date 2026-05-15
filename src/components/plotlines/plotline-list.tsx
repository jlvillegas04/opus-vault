"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, GitBranch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { PlotlineForm } from "./plotline-form";
import { PlotlineSheet } from "./plotline-sheet";
import type { Plotline } from "@/lib/db/schema";

const STATUS_STYLES: Record<string, string> = {
  active: "bg-green-500/15 text-green-400 border-green-500/20",
  resolved: "bg-blue-500/15 text-blue-400 border-blue-500/20",
  dormant: "bg-yellow-500/15 text-yellow-400 border-yellow-500/20",
  abandoned: "bg-muted text-muted-foreground",
};

async function fetchPlotlines(): Promise<Plotline[]> {
  const res = await fetch("/api/plotlines");
  if (!res.ok) throw new Error("Failed to fetch plotlines");
  return res.json();
}

export function PlotlineList() {
  const [newFormOpen, setNewFormOpen] = useState(false);
  const [selectedPlotline, setSelectedPlotline] = useState<Plotline | null>(null);

  const { data: plotlines, isLoading } = useQuery({
    queryKey: ["plotlines"],
    queryFn: fetchPlotlines,
  });

  return (
    <div className="space-y-6">
      {/* Page header */}
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

      {/* Loading skeletons */}
      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-36" />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && plotlines?.length === 0 && (
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
      )}

      {/* Plotlines grid */}
      {!isLoading && plotlines && plotlines.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {plotlines.map((plotline) => (
            <Card
              key={plotline.id}
              className="flex flex-col cursor-pointer hover:bg-accent/50 transition-colors"
              onClick={() => setSelectedPlotline(plotline)}
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

      {/* New plotline dialog */}
      <PlotlineForm open={newFormOpen} onOpenChange={setNewFormOpen} />

      {/* Detail / edit sheet */}
      <PlotlineSheet plotline={selectedPlotline} onClose={() => setSelectedPlotline(null)} />
    </div>
  );
}
