"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Plus, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { FilterBar, type FilterOption } from "@/components/ui/filter-bar";
import { cn } from "@/lib/utils";
import { EventForm } from "./event-form";
import type { Event as CampaignEvent } from "@/lib/db/schema";

const EVENT_TYPE_FILTERS: FilterOption[] = [
  {
    value: "session",
    label: "Session",
    className: "bg-primary/15 text-primary border-primary/20",
  },
  {
    value: "lore",
    label: "Lore",
    className: "bg-muted text-muted-foreground",
  },
];

async function fetchEvents(): Promise<CampaignEvent[]> {
  const res = await fetch("/api/events");
  if (!res.ok) throw new Error("Failed to fetch events");
  return res.json();
}

export function EventList() {
  const router = useRouter();
  const [newFormOpen, setNewFormOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const { data: events, isLoading } = useQuery({
    queryKey: ["events"],
    queryFn: fetchEvents,
  });

  const filtered = useMemo(() => {
    if (!events) return [];
    const q = search.toLowerCase();
    return events.filter((e) => {
      const matchesSearch =
        !q ||
        e.title.toLowerCase().includes(q) ||
        e.description?.toLowerCase().includes(q) ||
        e.eventDate?.toLowerCase().includes(q);
      const matchesFilter =
        !activeFilter ||
        (activeFilter === "session" && e.sessionNumber != null) ||
        (activeFilter === "lore" && e.sessionNumber == null);
      return matchesSearch && matchesFilter;
    });
  }, [events, search, activeFilter]);

  return (
    <div className="space-y-6 p-4 overflow-auto flex-1">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Events</h1>
          <p className="text-muted-foreground mt-1">Session timeline and historical events</p>
        </div>
        <Button onClick={() => setNewFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Event
        </Button>
      </div>

      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-36" />
          ))}
        </div>
      )}

      {!isLoading && events && (
        events.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <CalendarDays className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-medium text-lg">No events yet</h3>
            <p className="text-muted-foreground text-sm mt-1 mb-4">
              Record the sessions and key moments in your campaign.
            </p>
            <Button onClick={() => setNewFormOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add your first event
            </Button>
          </div>
        ) : (
          <>
            <FilterBar
              search={search}
              onSearchChange={setSearch}
              placeholder="Search events..."
              filters={EVENT_TYPE_FILTERS}
              activeFilter={activeFilter}
              onFilterChange={setActiveFilter}
            />

            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <CalendarDays className="h-10 w-10 text-muted-foreground mb-3" />
                <p className="font-medium">No events match your filters</p>
                <button
                  className="text-sm text-muted-foreground hover:text-foreground mt-1 underline-offset-4 hover:underline"
                  onClick={() => { setSearch(""); setActiveFilter(null); }}
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((event) => (
                  <Card
                    key={event.id}
                    className="flex flex-col cursor-pointer hover:bg-accent/50 transition-colors"
                    onClick={() => router.push(`/events/${event.id}`)}
                  >
                    <CardHeader className="pb-2">
                      <CardTitle className="truncate text-base">{event.title}</CardTitle>
                      {event.eventDate && (
                        <p className="text-xs text-muted-foreground">{event.eventDate}</p>
                      )}
                      {event.sessionNumber != null && (
                        <CardAction>
                          <Badge
                            variant="outline"
                            className={cn("bg-primary/15 text-primary border-primary/20")}
                          >
                            Sesión {event.sessionNumber}
                          </Badge>
                        </CardAction>
                      )}
                    </CardHeader>

                    {event.description && (
                      <CardContent className="pb-4 flex-1">
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {event.description}
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

      <EventForm open={newFormOpen} onOpenChange={setNewFormOpen} />

    </div>
  );
}
