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
import type { Item } from "@/lib/db/schema";

const RARITY_STYLES: Record<string, string> = {
  common: "bg-muted text-muted-foreground",
  uncommon: "bg-green-500/15 text-green-400 border-green-500/20",
  rare: "bg-blue-500/15 text-blue-400 border-blue-500/20",
  very_rare: "bg-purple-500/15 text-purple-400 border-purple-500/20",
  legendary: "bg-orange-500/15 text-orange-400 border-orange-500/20",
  artifact: "bg-red-500/15 text-red-400 border-red-500/20",
  unique: "bg-yellow-500/15 text-yellow-400 border-yellow-500/20",
};

const RARITY_LABELS: Record<string, string> = {
  common: "Common",
  uncommon: "Uncommon",
  rare: "Rare",
  very_rare: "Very Rare",
  legendary: "Legendary",
  artifact: "Artifact",
  unique: "Unique",
};

const RARITY_OPTIONS: Array<{ value: Item["rarity"]; label: string }> = [
  { value: "common", label: "Common" },
  { value: "uncommon", label: "Uncommon" },
  { value: "rare", label: "Rare" },
  { value: "very_rare", label: "Very Rare" },
  { value: "legendary", label: "Legendary" },
  { value: "artifact", label: "Artifact" },
  { value: "unique", label: "Unique" },
];

interface ItemSheetProps {
  item: Item | null;
  onClose: () => void;
}

export function ItemSheet({ item, onClose }: ItemSheetProps) {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    rarity: "" as Item["rarity"] | "",
    description: "",
    properties: "",
    history: "",
  });

  // Sync form from item whenever the sheet opens a new item
  useEffect(() => {
    if (item) {
      setForm({
        name: item.name,
        rarity: item.rarity ?? "",
        description: item.description ?? "",
        properties: item.properties ?? "",
        history: item.history ?? "",
      });
      setEditing(false);
    }
  }, [item]);

  const field =
    (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleCancel = () => {
    if (!item) return;
    setForm({
      name: item.name,
      rarity: item.rarity ?? "",
      description: item.description ?? "",
      properties: item.properties ?? "",
      history: item.history ?? "",
    });
    setEditing(false);
  };

  const handleSave = async () => {
    if (!item) return;
    setSaving(true);
    try {
      await fetch(`/api/items/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          rarity: form.rarity || undefined,
          description: form.description || undefined,
          properties: form.properties || undefined,
          history: form.history || undefined,
        }),
      });
      await queryClient.invalidateQueries({ queryKey: ["items"] });
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!item) return;
    if (!confirm(`¿Eliminar "${item.name}"? Esta acción no se puede deshacer.`)) return;
    await fetch(`/api/items/${item.id}`, { method: "DELETE" });
    await queryClient.invalidateQueries({ queryKey: ["items"] });
    onClose();
  };

  return (
    <Sheet open={!!item} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="sm:max-w-xl w-full flex flex-col p-0 gap-0">
        {item && (
          <>
            {/* Fixed header */}
            <div className="px-6 pt-6 pb-4 border-b shrink-0">
              <SheetHeader className="text-left space-y-0 mb-3">
                {editing ? (
                  <Input
                    value={form.name}
                    onChange={field("name")}
                    className="text-lg font-semibold h-auto py-1"
                    placeholder="Nombre del objeto"
                  />
                ) : (
                  <SheetTitle className="text-xl leading-tight">{form.name}</SheetTitle>
                )}
              </SheetHeader>

              {/* Rarity + action buttons */}
              <div className="flex items-center gap-2">
                {editing ? (
                  <select
                    value={form.rarity ?? ""}
                    onChange={field("rarity")}
                    className="h-7 rounded-md border border-input bg-background px-2 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring cursor-pointer"
                  >
                    <option value="" className="bg-background">
                      — No rarity —
                    </option>
                    {RARITY_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value ?? ""} className="bg-background">
                        {o.label}
                      </option>
                    ))}
                  </select>
                ) : form.rarity ? (
                  <Badge
                    variant="outline"
                    className={cn("text-xs", RARITY_STYLES[form.rarity])}
                  >
                    {RARITY_LABELS[form.rarity] ?? form.rarity}
                  </Badge>
                ) : (
                  <span className="text-xs text-muted-foreground">Sin rareza</span>
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
                      placeholder="Descripción del objeto…"
                      rows={4}
                    />
                  ) : form.description ? (
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{form.description}</p>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">Sin descripción.</p>
                  )}
                </section>

                <Separator />

                {/* Properties */}
                <section className="space-y-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Propiedades
                  </h3>
                  {editing ? (
                    <Textarea
                      value={form.properties}
                      onChange={field("properties")}
                      placeholder="Propiedades mágicas, estadísticas…"
                      rows={5}
                    />
                  ) : form.properties ? (
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{form.properties}</p>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">Sin propiedades registradas.</p>
                  )}
                </section>

                <Separator />

                {/* History */}
                <section className="space-y-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Historia
                  </h3>
                  {editing ? (
                    <Textarea
                      value={form.history}
                      onChange={field("history")}
                      placeholder="Historia y procedencia del objeto…"
                      rows={4}
                    />
                  ) : form.history ? (
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{form.history}</p>
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
