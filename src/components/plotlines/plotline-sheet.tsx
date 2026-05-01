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
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { Plotline } from "@/lib/db/schema";

const STATUS_STYLES: Record<string, string> = {
  active: "bg-green-500/15 text-green-400 border-green-500/20",
  resolved: "bg-blue-500/15 text-blue-400 border-blue-500/20",
  dormant: "bg-yellow-500/15 text-yellow-400 border-yellow-500/20",
  abandoned: "bg-muted text-muted-foreground",
};

const STATUS_OPTIONS: Plotline["status"][] = ["active", "resolved", "dormant", "abandoned"];

interface PlotlineSheetProps {
  plotline: Plotline | null;
  onClose: () => void;
}

export function PlotlineSheet({ plotline, onClose }: PlotlineSheetProps) {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "",
    status: "active" as Plotline["status"],
    description: "",
    hooks: "",
    complications: "",
    potentialResolutions: "",
  });

  useEffect(() => {
    if (plotline) {
      setForm({
        title: plotline.title,
        status: plotline.status ?? "active",
        description: plotline.description ?? "",
        hooks: plotline.hooks ?? "",
        complications: plotline.complications ?? "",
        potentialResolutions: plotline.potentialResolutions ?? "",
      });
      setEditing(false);
    }
  }, [plotline]);

  const field =
    (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleCancel = () => {
    if (!plotline) return;
    setForm({
      title: plotline.title,
      status: plotline.status ?? "active",
      description: plotline.description ?? "",
      hooks: plotline.hooks ?? "",
      complications: plotline.complications ?? "",
      potentialResolutions: plotline.potentialResolutions ?? "",
    });
    setEditing(false);
  };

  const handleSave = async () => {
    if (!plotline) return;
    setSaving(true);
    try {
      await fetch(`/api/plotlines/${plotline.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          status: form.status,
          description: form.description || undefined,
          hooks: form.hooks || undefined,
          complications: form.complications || undefined,
          potentialResolutions: form.potentialResolutions || undefined,
        }),
      });
      await queryClient.invalidateQueries({ queryKey: ["plotlines"] });
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!plotline) return;
    if (!confirm(`¿Eliminar "${plotline.title}"? Esta acción no se puede deshacer.`)) return;
    await fetch(`/api/plotlines/${plotline.id}`, { method: "DELETE" });
    await queryClient.invalidateQueries({ queryKey: ["plotlines"] });
    onClose();
  };

  return (
    <Sheet open={!!plotline} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="sm:max-w-xl w-full flex flex-col p-0 gap-0">
        {plotline && (
          <>
            {/* Fixed header */}
            <div className="px-6 pt-6 pb-4 border-b shrink-0">
              <SheetHeader className="text-left space-y-0 mb-3">
                {editing ? (
                  <Input
                    value={form.title}
                    onChange={field("title")}
                    className="text-lg font-semibold h-auto py-1"
                    placeholder="Nombre de la trama"
                  />
                ) : (
                  <SheetTitle className="text-xl leading-tight">{form.title}</SheetTitle>
                )}
              </SheetHeader>

              {/* Status + action buttons */}
              <div className="flex items-center gap-2">
                {editing ? (
                  <select
                    value={form.status ?? "active"}
                    onChange={field("status")}
                    className="h-7 rounded-md border border-input bg-background px-2 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring cursor-pointer"
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s ?? "active"} className="bg-background">
                        {s ? s.charAt(0).toUpperCase() + s.slice(1) : "Active"}
                      </option>
                    ))}
                  </select>
                ) : (
                  <Badge
                    variant="outline"
                    className={cn(
                      "capitalize text-xs",
                      STATUS_STYLES[form.status ?? "active"]
                    )}
                  >
                    {form.status ?? "active"}
                  </Badge>
                )}

                <div className="ml-auto flex items-center gap-1">
                  {editing ? (
                    <>
                      <Button size="sm" variant="ghost" onClick={handleCancel} disabled={saving}>
                        <X className="h-3.5 w-3.5 mr-1" />
                        Cancelar
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleSave}
                        disabled={saving || !form.title.trim()}
                      >
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
                      placeholder="¿De qué trata esta trama?"
                      rows={4}
                    />
                  ) : form.description ? (
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {form.description}
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">Sin descripción.</p>
                  )}
                </section>

                <Separator />

                {/* Hooks */}
                <section className="space-y-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Ganchos
                  </h3>
                  {editing ? (
                    <Textarea
                      value={form.hooks}
                      onChange={field("hooks")}
                      placeholder="Ganchos de historia posibles…"
                      rows={4}
                    />
                  ) : form.hooks ? (
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{form.hooks}</p>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">Sin ganchos registrados.</p>
                  )}
                </section>

                <Separator />

                {/* Complications */}
                <section className="space-y-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Complicaciones
                  </h3>
                  {editing ? (
                    <Textarea
                      value={form.complications}
                      onChange={field("complications")}
                      placeholder="Complicaciones potenciales…"
                      rows={4}
                    />
                  ) : form.complications ? (
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {form.complications}
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">
                      Sin complicaciones registradas.
                    </p>
                  )}
                </section>

                <Separator />

                {/* Potential Resolutions */}
                <section className="space-y-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Resoluciones posibles
                  </h3>
                  {editing ? (
                    <Textarea
                      value={form.potentialResolutions}
                      onChange={field("potentialResolutions")}
                      placeholder="Cómo podría resolverse…"
                      rows={4}
                    />
                  ) : form.potentialResolutions ? (
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {form.potentialResolutions}
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">
                      Sin resoluciones registradas.
                    </p>
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
