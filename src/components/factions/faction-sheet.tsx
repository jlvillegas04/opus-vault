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
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Faction } from "@/lib/db/schema";

interface FactionSheetProps {
  faction: Faction | null;
  onClose: () => void;
}

export function FactionSheet({ faction, onClose }: FactionSheetProps) {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    alignment: "",
    description: "",
    goals: "",
  });

  // Sync form from faction whenever the sheet opens a new faction
  useEffect(() => {
    if (faction) {
      setForm({
        name: faction.name,
        alignment: faction.alignment ?? "",
        description: faction.description ?? "",
        goals: faction.goals ?? "",
      });
      setEditing(false);
    }
  }, [faction]);

  const field =
    (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleCancel = () => {
    if (!faction) return;
    setForm({
      name: faction.name,
      alignment: faction.alignment ?? "",
      description: faction.description ?? "",
      goals: faction.goals ?? "",
    });
    setEditing(false);
  };

  const handleSave = async () => {
    if (!faction) return;
    setSaving(true);
    try {
      await fetch(`/api/factions/${faction.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          alignment: form.alignment || undefined,
          description: form.description || undefined,
          goals: form.goals || undefined,
        }),
      });
      await queryClient.invalidateQueries({ queryKey: ["factions"] });
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!faction) return;
    if (!confirm(`¿Eliminar "${faction.name}"? Esta acción no se puede deshacer.`)) return;
    await fetch(`/api/factions/${faction.id}`, { method: "DELETE" });
    await queryClient.invalidateQueries({ queryKey: ["factions"] });
    onClose();
  };

  return (
    <Sheet open={!!faction} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="sm:max-w-xl w-full flex flex-col p-0 gap-0">
        {faction && (
          <>
            {/* Fixed header */}
            <div className="px-6 pt-6 pb-4 border-b shrink-0">
              <SheetHeader className="text-left space-y-0 mb-3">
                {editing ? (
                  <Input
                    value={form.name}
                    onChange={field("name")}
                    className="text-lg font-semibold h-auto py-1"
                    placeholder="Nombre de la facción"
                  />
                ) : (
                  <SheetTitle className="text-xl leading-tight">{form.name}</SheetTitle>
                )}
                {(editing || form.alignment) && (
                  <div className="pt-1">
                    {editing ? (
                      <Input
                        value={form.alignment}
                        onChange={field("alignment")}
                        className="text-sm h-auto py-1 text-muted-foreground"
                        placeholder="Neutral Evil, Chaotic Good…"
                      />
                    ) : (
                      <p className="text-sm text-muted-foreground">{form.alignment}</p>
                    )}
                  </div>
                )}
              </SheetHeader>

              {/* Action buttons */}
              <div className="flex items-center gap-2">
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
                      placeholder="Descripción de la facción…"
                      rows={5}
                    />
                  ) : form.description ? (
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{form.description}</p>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">Sin descripción.</p>
                  )}
                </section>

                <Separator />

                {/* Goals */}
                <section className="space-y-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Objetivos
                  </h3>
                  {editing ? (
                    <Textarea
                      value={form.goals}
                      onChange={field("goals")}
                      placeholder="Qué busca esta facción…"
                      rows={5}
                    />
                  ) : form.goals ? (
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{form.goals}</p>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">Sin objetivos registrados.</p>
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
