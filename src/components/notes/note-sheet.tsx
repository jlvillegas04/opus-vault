"use client";

import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Pencil, Trash2, X, Check } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Note } from "@/lib/db/schema";

interface NoteSheetProps {
  note: Note | null;
  onClose: () => void;
}

export function NoteSheet({ note, onClose }: NoteSheetProps) {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: "", content: "" });

  useEffect(() => {
    if (note) {
      setForm({ title: note.title, content: note.content ?? "" });
      setEditing(false);
    }
  }, [note]);

  const handleCancel = () => {
    if (!note) return;
    setForm({ title: note.title, content: note.content ?? "" });
    setEditing(false);
  };

  const handleSave = async () => {
    if (!note) return;
    setSaving(true);
    try {
      await fetch(`/api/notes/${note.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          content: form.content || undefined,
        }),
      });
      await queryClient.invalidateQueries({ queryKey: ["notes"] });
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!note) return;
    if (!confirm(`¿Eliminar "${note.title}"? Esta acción no se puede deshacer.`)) return;
    await fetch(`/api/notes/${note.id}`, { method: "DELETE" });
    await queryClient.invalidateQueries({ queryKey: ["notes"] });
    onClose();
  };

  return (
    <Sheet open={!!note} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="sm:max-w-2xl w-full flex flex-col p-0 gap-0">
        {note && (
          <>
            {/* Fixed header */}
            <div className="px-6 pt-6 pb-4 border-b shrink-0">
              <SheetHeader className="text-left space-y-0 mb-3">
                {editing ? (
                  <Input
                    value={form.title}
                    onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                    className="text-lg font-semibold h-auto py-1"
                    placeholder="Título de la nota"
                  />
                ) : (
                  <SheetTitle className="text-xl leading-tight">{form.title}</SheetTitle>
                )}
              </SheetHeader>

              <div className="flex items-center gap-1 justify-end">
                {editing ? (
                  <>
                    <Button size="sm" variant="ghost" onClick={handleCancel} disabled={saving}>
                      <X className="h-3.5 w-3.5 mr-1" />
                      Cancelar
                    </Button>
                    <Button size="sm" onClick={handleSave} disabled={saving || !form.title.trim()}>
                      <Check className="h-3.5 w-3.5 mr-1" />
                      {saving ? "Guardando…" : "Guardar"}
                    </Button>
                  </>
                ) : (
                  <>
                    <Button size="sm" variant="ghost" onClick={() => setEditing(true)}>
                      <Pencil className="h-3.5 w-3.5 mr-1" />
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={handleDelete}
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-1" />
                      Eliminar
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Scrollable content */}
            <ScrollArea className="flex-1">
              <div className="px-6 py-6">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  Contenido
                </h3>
                {editing ? (
                  <Textarea
                    value={form.content}
                    onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))}
                    placeholder="Contenido de la nota…"
                    rows={20}
                  />
                ) : form.content ? (
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{form.content}</p>
                ) : (
                  <p className="text-sm text-muted-foreground italic">Sin contenido.</p>
                )}
              </div>
            </ScrollArea>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
