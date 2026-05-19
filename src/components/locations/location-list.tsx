"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { FilterBar, type FilterOption } from "@/components/ui/filter-bar";
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

const LOCATION_TYPE_FILTERS: FilterOption[] = [
  { value: "world",      label: "World",      className: LOCATION_TYPE_STYLES.world },
  { value: "region",     label: "Region",     className: LOCATION_TYPE_STYLES.region },
  { value: "city",       label: "City",       className: LOCATION_TYPE_STYLES.city },
  { value: "district",   label: "District",   className: LOCATION_TYPE_STYLES.district },
  { value: "building",   label: "Building",   className: LOCATION_TYPE_STYLES.building },
  { value: "dungeon",    label: "Dungeon",    className: LOCATION_TYPE_STYLES.dungeon },
  { value: "wilderness", label: "Wilderness", className: LOCATION_TYPE_STYLES.wilderness },
  { value: "plane",      label: "Plane",      className: LOCATION_TYPE_STYLES.plane },
  { value: "other",      label: "Other",      className: LOCATION_TYPE_STYLES.other },
];

async function fetchLocations(): Promise<Location[]> {
  const res = await fetch("/api/locations");
  if (!res.ok) throw new Error("Failed to fetch locations");
  return res.json();
}

export function LocationList() {
  const [newFormOpen, setNewFormOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const { data: locations, isLoading } = useQuery({
    queryKey: ["locations"],
    queryFn: fetchLocations,
  });

  const filtered = useMemo(() => {
    if (!locations) return [];
    const q = search.toLowerCase();
    return locations.filter((loc) => {
      const matchesSearch =
        !q ||
        loc.name.toLowerCase().includes(q) ||
        loc.description?.toLowerCase().includes(q);
      const matchesFilter = !activeFilter || (loc.locationType ?? "other") === activeFilter;
      return matchesSearch && matchesFilter;
    });
  }, [locations, search, activeFilter]);

  return (
    <div className="space-y-6">
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

      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-36" />
          ))}
        </div>
      )}

      {!isLoading && locations && (
        locations.length === 0 ? (
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
        ) : (
          <>
            <FilterBar
              search={search}
              onSearchChange={setSearch}
              placeholder="Search locations..."
              filters={LOCATION_TYPE_FILTERS}
              activeFilter={activeFilter}
              onFilterChange={setActiveFilter}
            />

            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <MapPin className="h-10 w-10 text-muted-foreground mb-3" />
                <p className="font-medium">No locations match your filters</p>
                <button
                  className="text-sm text-muted-foreground hover:text-foreground mt-1 underline-offset-4 hover:underline"
                  onClick={() => { setSearch(""); setActiveFilter(null); }}
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((location) => (
                  <Card
                    key={location.id}
                    className="flex flex-col cursor-pointer hover:bg-accent/50 transition-colors"
                    onClick={() => setSelectedLocation(location)}
                  >
                    <CardHeader className="pb-2">
                      <CardTitle className="truncate text-base">{location.name}</CardTitle>
                      <CardAction>
                        <Badge
                          variant="outline"
                          className={cn("capitalize", LOCATION_TYPE_STYLES[location.locationType ?? "other"])}
                        >
                          {location.locationType ?? "other"}
                        </Badge>
                      </CardAction>
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
          </>
        )
      )}

      <LocationForm open={newFormOpen} onOpenChange={setNewFormOpen} />

      <LocationSheet location={selectedLocation} onClose={() => setSelectedLocation(null)} />
    </div>
  );
}
