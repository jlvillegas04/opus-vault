"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { EventForm } from "./event-form";
import { EventSheet } from "./event-sheet";
import type { Event as CampaignEvent } from "@/lib/db/schema";

async function fetchEvents(): Promise<CampaignEvent[]> {
  const res = await fetch("/api/events");
  if (!res.ok) throw new Error("Failed to fetch events");
  return res.json();
}

export function EventList() {
  const [newFormOpen, setNewFormOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CampaignEvent | null>(null);

  const { data: events, isLoading } = useQuery({
    queryKey: ["events"],
    queryFn: fetchEvents,
  });

  return (
    <div className="space-y-6">
      {/* Page header */}
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

      {/* Loading skeletons */}
      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-36" />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && events?.length === 0 && (
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
      )}

      {/* Events grid */}
      {!isLoading && events && events.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <Card
              key={event.id}
              className="flex flex-col cursor-pointer hover:bg-accent/50 transition-colors"
              onClick={() => setSelectedEvent(event)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="truncate text-base">{event.title}</CardTitle>
                  {event.sessionNumber != null && (
                    <Badge
                      variant="outline"
                      className={cn(
                        "shrink-0",
                        "bg-primary/15 text-primary border-primary/20"
                      )}
                    >
                      Sesión {event.sessionNumber}
                    </Badge>
                  )}
                </div>
                {event.eventDate && (
                  <p className="text-xs text-muted-foreground mt-0.5">{event.eventDate}</p>
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

      {/* New event dialog */}
      <EventForm open={newFormOpen} onOpenChange={setNewFormOpen} />

      {/* Detail / edit sheet */}
      <EventSheet event={selectedEvent} onClose={() => setSelectedEvent(null)} />
    </div>
  );
}
