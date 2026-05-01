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
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { Character } from "@/lib/db/schema";

const STATUS_STYLES: Record<string, string> = {
  alive: "bg-green-500/15 text-green-400 border-green-500/20",
  dead: "bg-red-500/15 text-red-400 border-red-500/20",
  missing: "bg-yellow-500/15 text-yellow-400 border-yellow-500/20",
  unknown: "bg-muted text-muted-foreground",
};

const STATUS_OPTIONS = ["alive", "dead", "missing", "unknown"] as const;

interface CharacterSheetProps {
  character: Character | null;
  onClose: () => void;
}

export function CharacterSheet({ character, onClose }: CharacterSheetProps) {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    title: "",
    description: "",
    backstory: "",
    status: "alive" as Character["status"],
  });

  // Sync form from character whenever the sheet opens a new character
  useEffect(() => {
    if (character) {
      setForm({
        name: character.name,
        title: character.title ?? "",
        description: character.description ?? "",
        backstory: character.backstory ?? "",
        status: character.status ?? "alive",
      });
      setEditing(false);
    }
  }, [character]);

  const field =
    (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleCancel = () => {
    if (!character) return;
    setForm({
      name: character.name,
      title: character.title ?? "",
      description: character.description ?? "",
      backstory: character.backstory ?? "",
      status: character.status ?? "alive",
    });
    setEditing(false);
  };

  const handleSave = async () => {
    if (!character) return;
    setSaving(true);
    try {
      await fetch(`/api/characters/${character.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          title: form.title || undefined,
          description: form.description || undefined,
          backstory: form.backstory || undefined,
          status: form.status,
        }),
      });
      await queryClient.invalidateQueries({ queryKey: ["characters"] });
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!character) return;
    if (!confirm(`¿Eliminar "${character.name}"? Esta acción no se puede deshacer.`)) return;
    await fetch(`/api/characters/${character.id}`, { method: "DELETE" });
    await queryClient.invalidateQueries({ queryKey: ["characters"] });
    onClose();
  };

  return (
    <Sheet open={!!character} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="sm:max-w-xl w-full flex flex-col p-0 gap-0">
        {character && (
          <>
            {/* Fixed header */}
            <div className="px-6 pt-6 pb-4 border-b shrink-0">
              <SheetHeader className="text-left space-y-0 mb-3">
                {editing ? (
                  <Input
                    value={form.name}
                    onChange={field("name")}
                    className="text-lg font-semibold h-auto py-1"
                    placeholder="Nombre del personaje"
                  />
                ) : (
                  <SheetTitle className="text-xl leading-tight">{form.name}</SheetTitle>
                )}
                {(editing || form.title) && (
                  <div className="pt-1">
                    {editing ? (
                      <Input
                        value={form.title}
                        onChange={field("title")}
                        className="text-sm h-auto py-1 text-muted-foreground"
                        placeholder="Título o rol"
                      />
                    ) : (
                      <p className="text-sm text-muted-foreground">{form.title}</p>
                    )}
                  </div>
                )}
              </SheetHeader>

              {/* Status + action buttons */}
              <div className="flex items-center gap-2">
                {editing ? (
                  <select
                    value={form.status ?? "alive"}
                    onChange={field("status")}
                    className="h-7 rounded-md border border-input bg-background px-2 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring cursor-pointer"
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s} className="bg-background">
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                      </option>
                    ))}
                  </select>
                ) : (
                  <Badge
                    variant="outline"
                    className={cn("capitalize text-xs", STATUS_STYLES[form.status ?? "unknown"])}
                  >
                    {form.status ?? "unknown"}
                  </Badge>
                )}

                <div className="ml-auto flex items-center gap-1">
                  {editing ? (
                    <>
                      <Button size="sm" variant="ghost" onClick={handleCancel} disabled={saving}>
                        <X className="h-3.5 w-3.5 mr-1" />
                        Cancelar
                      </Button>
                      <Button size="sm" onClick={handleSave} disabled={saving || !form.name.trim()}>
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
            </div>

            {/* Scrollable body */}
            <ScrollArea className="flex-1">
              <div className="px-6 py-6 space-y-6">
                {/* Description */}
                <section className="space-y-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Descripción
                  </h3>
                  {editing ? (
                    <Textarea
                      value={form.description}
                      onChange={field("description")}
                      placeholder="Apariencia, personalidad, rasgos visibles…"
                      rows={5}
                    />
                  ) : form.description ? (
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{form.description}</p>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">Sin descripción.</p>
                  )}
                </section>

                <Separator />

                {/* Backstory */}
                <section className="space-y-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Historia
                  </h3>
                  {editing ? (
                    <Textarea
                      value={form.backstory}
                      onChange={field("backstory")}
                      placeholder="Historia del personaje, motivaciones, secretos…"
                      rows={10}
                    />
                  ) : form.backstory ? (
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{form.backstory}</p>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">Sin historia registrada.</p>
                  )}
                </section>
              </div>
            </ScrollArea>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
