"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { LocationForm } from "./location-form";
import { LocationSheet } from "./location-sheet";
import type { Location } from "@/lib/db/schema";

const LOCATION_TYPE_STYLES: Record<string, string> = {
  world:      "bg-purple-500/15 text-purple-400 border-purple-500/20",
  region:     "bg-blue-500/15 text-blue-400 border-blue-500/20",
  city:       "bg-orange-500/15 text-orange-400 border-orange-500/20",
  district:   "bg-yellow-500/15 text-yellow-400 border-yellow-500/20",
  building:   "bg-stone-500/15 text-stone-400 border-stone-500/20",
  dungeon:    "bg-red-500/15 text-red-400 border-red-500/20",
  wilderness: "bg-green-500/15 text-green-400 border-green-500/20",
  plane:      "bg-indigo-500/15 text-indigo-400 border-indigo-500/20",
  other:      "bg-muted text-muted-foreground",
};

async function fetchLocations(): Promise<Location[]> {
  const res = await fetch("/api/locations");
  if (!res.ok) throw new Error("Failed to fetch locations");
  return res.json();
}

export function LocationList() {
  const [newFormOpen, setNewFormOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);

  const { data: locations, isLoading } = useQuery({
    queryKey: ["locations"],
    queryFn: fetchLocations,
  });

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Locations</h1>
          <p className="text-muted-foreground mt-1">Cities, dungeons, and regions in your campaign</p>
        </div>
        <Button onClick={() => setNewFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Location
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
      {!isLoading && locations?.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <MapPin className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="font-medium text-lg">No locations yet</h3>
          <p className="text-muted-foreground text-sm mt-1 mb-4">
            Add the places and regions your adventurers explore.
          </p>
          <Button onClick={() => setNewFormOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add your first location
          </Button>
        </div>
      )}

      {/* Location grid */}
      {!isLoading && locations && locations.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {locations.map((location) => (
            <Card
              key={location.id}
              className="flex flex-col cursor-pointer hover:bg-accent/50 transition-colors"
              onClick={() => setSelectedLocation(location)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="truncate text-base">{location.name}</CardTitle>
                  <Badge
                    variant="outline"
                    className={cn(
                      "shrink-0 capitalize",
                      LOCATION_TYPE_STYLES[location.locationType ?? "other"]
                    )}
                  >
                    {location.locationType ?? "other"}
                  </Badge>
                </div>
              </CardHeader>

              {location.description && (
                <CardContent className="pb-4 flex-1">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {location.description}
                  </p>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* New location dialog */}
      <LocationForm
        open={newFormOpen}
        onOpenChange={setNewFormOpen}
      />

      {/* Detail / edit sheet */}
      <LocationSheet
        location={selectedLocation}
        onClose={() => setSelectedLocation(null)}
      />
    </div>
  );
}
