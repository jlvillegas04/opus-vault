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
import type { Event as CampaignEvent } from "@/lib/db/schema";

interface EventSheetProps {
  event: CampaignEvent | null;
  onClose: () => void;
}

export function EventSheet({ event, onClose }: EventSheetProps) {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "",
    sessionNumber: "",
    eventDate: "",
    description: "",
    consequences: "",
  });

  useEffect(() => {
    if (event) {
      setForm({
        title: event.title,
        sessionNumber: event.sessionNumber != null ? String(event.sessionNumber) : "",
        eventDate: event.eventDate ?? "",
        description: event.description ?? "",
        consequences: event.consequences ?? "",
      });
      setEditing(false);
    }
  }, [event]);

  const field =
    (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleCancel = () => {
    if (!event) return;
    setForm({
      title: event.title,
      sessionNumber: event.sessionNumber != null ? String(event.sessionNumber) : "",
      eventDate: event.eventDate ?? "",
      description: event.description ?? "",
      consequences: event.consequences ?? "",
    });
    setEditing(false);
  };

  const handleSave = async () => {
    if (!event) return;
    setSaving(true);
    try {
      await fetch(`/api/events/${event.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          sessionNumber:
            form.sessionNumber !== "" ? parseInt(form.sessionNumber, 10) : undefined,
          eventDate: form.eventDate || undefined,
          description: form.description || undefined,
          consequences: form.consequences || undefined,
        }),
      });
      await queryClient.invalidateQueries({ queryKey: ["events"] });
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!event) return;
    if (!confirm(`¿Eliminar "${event.title}"? Esta acción no se puede deshacer.`)) return;
    await fetch(`/api/events/${event.id}`, { method: "DELETE" });
    await queryClient.invalidateQueries({ queryKey: ["events"] });
    onClose();
  };

  return (
    <Sheet open={!!event} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="sm:max-w-xl w-full flex flex-col p-0 gap-0">
        {event && (
          <>
            {/* Fixed header */}
            <div className="px-6 pt-6 pb-4 border-b shrink-0">
              <SheetHeader className="text-left space-y-0 mb-3">
                {editing ? (
                  <Input
                    value={form.title}
                    onChange={field("title")}
                    className="text-lg font-semibold h-auto py-1"
                    placeholder="Nombre del evento"
                  />
                ) : (
                  <SheetTitle className="text-xl leading-tight">{form.title}</SheetTitle>
                )}

                {/* Session badge */}
                <div className="flex items-center gap-2 pt-1">
                  {editing ? (
                    <div className="flex items-center gap-2 flex-wrap">
                      <Input
                        type="number"
                        value={form.sessionNumber}
                        onChange={field("sessionNumber")}
                        className="w-28 text-sm h-auto py-1"
                        placeholder="Nº sesión"
                      />
                      <Input
                        value={form.eventDate}
                        onChange={field("eventDate")}
                        className="text-sm h-auto py-1"
                        placeholder="Fecha en el mundo"
                      />
                    </div>
                  ) : (
                    <>
                      {form.sessionNumber !== "" && (
                        <Badge
                          variant="outline"
                          className={cn("text-xs", "bg-primary/15 text-primary border-primary/20")}
                        >
                          Sesión {form.sessionNumber}
                        </Badge>
                      )}
                      {form.eventDate && (
                        <p className="text-xs text-muted-foreground">{form.eventDate}</p>
                      )}
                    </>
                  )}
                </div>
              </SheetHeader>

              {/* Action buttons */}
              <div className="flex items-center gap-2 mt-2">
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
                      placeholder="¿Qué ocurrió en esta sesión/evento?"
                      rows={5}
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

                {/* Consequences */}
                <section className="space-y-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Consecuencias
                  </h3>
                  {editing ? (
                    <Textarea
                      value={form.consequences}
                      onChange={field("consequences")}
                      placeholder="Consecuencias para el mundo…"
                      rows={5}
                    />
                  ) : form.consequences ? (
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {form.consequences}
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">Sin consecuencias registradas.</p>
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
