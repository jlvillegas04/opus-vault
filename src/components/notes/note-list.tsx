"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, ScrollText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { NoteForm } from "./note-form";
import { NoteSheet } from "./note-sheet";
import type { Note } from "@/lib/db/schema";

async function fetchNotes(): Promise<Note[]> {
  const res = await fetch("/api/notes");
  if (!res.ok) throw new Error("Failed to fetch notes");
  return res.json();
}

export function NoteList() {
  const [newFormOpen, setNewFormOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);

  const { data: notes, isLoading } = useQuery({
    queryKey: ["notes"],
    queryFn: fetchNotes,
  });

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notes</h1>
          <p className="text-muted-foreground mt-1">Session notes and campaign documents</p>
        </div>
        <Button onClick={() => setNewFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Note
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
      {!isLoading && notes?.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <ScrollText className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="font-medium text-lg">No notes yet</h3>
          <p className="text-muted-foreground text-sm mt-1 mb-4">
            Capture session notes and campaign documents here.
          </p>
          <Button onClick={() => setNewFormOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add your first note
          </Button>
        </div>
      )}

      {/* Notes grid — each card opens the detail sheet */}
      {!isLoading && notes && notes.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {notes.map((note) => (
            <Card
              key={note.id}
              className="flex flex-col cursor-pointer hover:bg-accent/50 transition-colors"
              onClick={() => setSelectedNote(note)}
            >
              <CardHeader className="pb-2">
                <CardTitle className="truncate text-base">{note.title}</CardTitle>
              </CardHeader>

              {note.content && (
                <CardContent className="pb-4 flex-1">
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {note.content}
                  </p>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* New note dialog */}
      <NoteForm open={newFormOpen} onOpenChange={setNewFormOpen} />

      {/* Detail / edit sheet */}
      <NoteSheet note={selectedNote} onClose={() => setSelectedNote(null)} />
    </div>
  );
}
