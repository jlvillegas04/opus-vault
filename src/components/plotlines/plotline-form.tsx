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
import type { Plotline } from "@/lib/db/schema";

interface PlotlineFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const STATUS_OPTIONS: Plotline["status"][] = ["active", "resolved", "dormant", "abandoned"];

const emptyForm = {
  title: "",
  status: "active" as Plotline["status"],
  description: "",
  hooks: "",
  complications: "",
  potentialResolutions: "",
};

export function PlotlineForm({ open, onOpenChange }: PlotlineFormProps) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const field =
    (key: keyof typeof emptyForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = {
        title: form.title,
        status: form.status,
        ...(form.description && { description: form.description }),
        ...(form.hooks && { hooks: form.hooks }),
        ...(form.complications && { complications: form.complications }),
        ...(form.potentialResolutions && { potentialResolutions: form.potentialResolutions }),
      };

      await fetch("/api/plotlines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      await queryClient.invalidateQueries({ queryKey: ["plotlines"] });
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
          <DialogTitle>New Plotline</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <label className="text-sm font-medium leading-none">Title *</label>
            <Input
              required
              value={form.title}
              onChange={field("title")}
              placeholder="The Dragon's Return"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium leading-none">Status</label>
            <select
              value={form.status ?? "active"}
              onChange={field("status")}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring cursor-pointer"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s ?? "active"} className="bg-background">
                  {s ? s.charAt(0).toUpperCase() + s.slice(1) : "Active"}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium leading-none">Description</label>
            <Textarea
              value={form.description}
              onChange={field("description")}
              placeholder="What is this story arc about?"
              rows={2}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium leading-none">Hooks</label>
            <Textarea
              value={form.hooks}
              onChange={field("hooks")}
              placeholder="Ganchos de historia posibles…"
              rows={2}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium leading-none">Complications</label>
            <Textarea
              value={form.complications}
              onChange={field("complications")}
              placeholder="Complicaciones potenciales…"
              rows={2}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium leading-none">Potential Resolutions</label>
            <Textarea
              value={form.potentialResolutions}
              onChange={field("potentialResolutions")}
              placeholder="Cómo podría resolverse…"
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving…" : "Create Plotline"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
