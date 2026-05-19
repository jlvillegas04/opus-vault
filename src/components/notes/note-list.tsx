"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Plus, ScrollText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { FilterBar } from "@/components/ui/filter-bar";
import { NoteForm } from "./note-form";
import type { Note } from "@/lib/db/schema";

async function fetchNotes(): Promise<Note[]> {
  const res = await fetch("/api/notes");
  if (!res.ok) throw new Error("Failed to fetch notes");
  return res.json();
}

export function NoteList() {
  const router = useRouter();
  const [newFormOpen, setNewFormOpen] = useState(false);
  const [search, setSearch] = useState("");

  const { data: notes, isLoading } = useQuery({
    queryKey: ["notes"],
    queryFn: fetchNotes,
  });

  const filtered = useMemo(() => {
    if (!notes) return [];
    const q = search.toLowerCase();
    return notes.filter((n) =>
      !q ||
      n.title.toLowerCase().includes(q) ||
      n.content?.toLowerCase().includes(q)
    );
  }, [notes, search]);

  return (
    <div className="space-y-6 p-4 overflow-auto flex-1">
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

      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-36" />
          ))}
        </div>
      )}

      {!isLoading && notes && (
        notes.length === 0 ? (
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
        ) : (
          <>
            <FilterBar
              search={search}
              onSearchChange={setSearch}
              placeholder="Search notes..."
            />

            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <ScrollText className="h-10 w-10 text-muted-foreground mb-3" />
                <p className="font-medium">No notes match your search</p>
                <button
                  className="text-sm text-muted-foreground hover:text-foreground mt-1 underline-offset-4 hover:underline"
                  onClick={() => setSearch("")}
                >
                  Clear search
                </button>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((note) => (
                  <Card
                    key={note.id}
                    className="flex flex-col cursor-pointer hover:bg-accent/50 transition-colors"
                    onClick={() => router.push(`/notes/${note.id}`)}
                  >
                    <CardHeader className="pb-2">
                      <CardTitle className="truncate text-base">{note.title}</CardTitle>
                    </CardHeader>

                    {note.content && (
                      <CardContent className="pb-4 flex-1">
                        <p className="text-sm text-muted-foreground line-clamp-3 whitespace-pre-line">
                          {note.content.replace(/^#+\s/gm, "").replace(/[*_`#>]/g, "")}
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

      <NoteForm open={newFormOpen} onOpenChange={setNewFormOpen} />
    </div>
  );
}
