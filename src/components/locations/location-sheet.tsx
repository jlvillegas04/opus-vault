"use client";

import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
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

const LOCATION_TYPES = [
  "world",
  "region",
  "city",
  "district",
  "building",
  "dungeon",
  "wilderness",
  "plane",
  "other",
] as const;

interface LocationSheetProps {
  location: Location | null;
  onClose: () => void;
}

async function fetchLocations(): Promise<Location[]> {
  const res = await fetch("/api/locations");
  if (!res.ok) throw new Error("Failed to fetch locations");
  return res.json();
}

export function LocationSheet({ location, onClose }: LocationSheetProps) {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    locationType: "other" as Location["locationType"],
    parentLocationId: "",
    description: "",
  });

  const { data: locations } = useQuery({
    queryKey: ["locations"],
    queryFn: fetchLocations,
  });

  // Sync form from location whenever the sheet opens a new location
  useEffect(() => {
    if (location) {
      setForm({
        name: location.name,
        locationType: location.locationType ?? "other",
        parentLocationId: location.parentLocationId ?? "",
        description: location.description ?? "",
      });
      setEditing(false);
    }
  }, [location]);

  const field =
    (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleCancel = () => {
    if (!location) return;
    setForm({
      name: location.name,
      locationType: location.locationType ?? "other",
      parentLocationId: location.parentLocationId ?? "",
      description: location.description ?? "",
    });
    setEditing(false);
  };

  const handleSave = async () => {
    if (!location) return;
    setSaving(true);
    try {
      await fetch(`/api/locations/${location.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          locationType: form.locationType,
          parentLocationId: form.parentLocationId || undefined,
          description: form.description || undefined,
        }),
      });
      await queryClient.invalidateQueries({ queryKey: ["locations"] });
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!location) return;
    if (!confirm(`¿Eliminar "${location.name}"? Esta acción no se puede deshacer.`)) return;
    await fetch(`/api/locations/${location.id}`, { method: "DELETE" });
    await queryClient.invalidateQueries({ queryKey: ["locations"] });
    onClose();
  };

  // Filter out the current location from parent options to avoid self-reference
  const parentOptions = locations?.filter((loc) => loc.id !== location?.id) ?? [];

  return (
    <Sheet open={!!location} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="sm:max-w-xl w-full flex flex-col p-0 gap-0">
        {location && (
          <>
            {/* Fixed header */}
            <div className="px-6 pt-6 pb-4 border-b shrink-0">
              <SheetHeader className="text-left space-y-0 mb-3">
                {editing ? (
                  <div className="space-y-2">
                    <Input
                      value={form.name}
                      onChange={field("name")}
                      className="text-lg font-semibold h-auto py-1"
                      placeholder="Nombre del lugar"
                    />
                    <select
                      value={form.locationType ?? "other"}
                      onChange={field("locationType")}
                      className="flex h-8 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring cursor-pointer"
                    >
                      {LOCATION_TYPES.map((t) => (
                        <option key={t} value={t} className="bg-background">
                          {t.charAt(0).toUpperCase() + t.slice(1)}
                        </option>
                      ))}
                    </select>
                    <select
                      value={form.parentLocationId}
                      onChange={field("parentLocationId")}
                      className="flex h-8 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring cursor-pointer"
                    >
                      <option value="" className="bg-background">— Sin ubicación padre —</option>
                      {parentOptions.map((loc) => (
                        <option key={loc.id} value={loc.id} className="bg-background">
                          {loc.name}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="flex items-start gap-2">
                    <SheetTitle className="min-w-0 break-words text-xl leading-tight">{form.name}</SheetTitle>
                    <Badge
                      variant="outline"
                      className={cn(
                        "shrink-0 capitalize mt-0.5",
                        LOCATION_TYPE_STYLES[form.locationType ?? "other"]
                      )}
                    >
                      {form.locationType ?? "other"}
                    </Badge>
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
                      placeholder="Describe este lugar…"
                      rows={8}
                    />
                  ) : form.description ? (
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{form.description}</p>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">Sin descripción.</p>
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
