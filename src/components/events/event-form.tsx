"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface EventFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const emptyForm = {
  title: "",
  sessionNumber: "",
  eventDate: "",
  description: "",
  consequences: "",
};

export function EventForm({ open, onOpenChange }: EventFormProps) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const field =
    (key: keyof typeof emptyForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload: Record<string, unknown> = {
        title: form.title,
        ...(form.description && { description: form.description }),
        ...(form.eventDate && { eventDate: form.eventDate }),
        ...(form.consequences && { consequences: form.consequences }),
        ...(form.sessionNumber !== "" && {
          sessionNumber: parseInt(form.sessionNumber, 10),
        }),
      };

      await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      await queryClient.invalidateQueries({ queryKey: ["events"] });
      setForm(emptyForm);
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) setForm(emptyForm);
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>New Event</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <label className="text-sm font-medium leading-none">Title *</label>
            <Input
              required
              value={form.title}
              onChange={field("title")}
              placeholder="Battle of the Iron Keep"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium leading-none">Session Number</label>
            <Input
              type="number"
              value={form.sessionNumber}
              onChange={field("sessionNumber")}
              placeholder="7"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium leading-none">In-World Date</label>
            <Input
              value={form.eventDate}
              onChange={field("eventDate")}
              placeholder="15 Frost Moon, Año 847"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium leading-none">Description</label>
            <Textarea
              value={form.description}
              onChange={field("description")}
              placeholder="¿Qué ocurrió en esta sesión/evento?"
              rows={3}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium leading-none">Consequences</label>
            <Textarea
              value={form.consequences}
              onChange={field("consequences")}
              placeholder="Consecuencias para el mundo…"
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving…" : "Create Event"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
