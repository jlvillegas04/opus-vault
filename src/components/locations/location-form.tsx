"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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
import type { Location } from "@/lib/db/schema";

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

interface LocationFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const emptyForm = {
  name: "",
  locationType: "other" as Location["locationType"],
  parentLocationId: "",
  description: "",
};

async function fetchLocations(): Promise<Location[]> {
  const res = await fetch("/api/locations");
  if (!res.ok) throw new Error("Failed to fetch locations");
  return res.json();
}

export function LocationForm({ open, onOpenChange }: LocationFormProps) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const { data: locations } = useQuery({
    queryKey: ["locations"],
    queryFn: fetchLocations,
  });

  const field =
    (key: keyof typeof emptyForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleOpenChange = (open: boolean) => {
    if (!open) setForm(emptyForm);
    onOpenChange(open);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = {
        name: form.name,
        locationType: form.locationType,
        ...(form.parentLocationId && { parentLocationId: form.parentLocationId }),
        ...(form.description && { description: form.description }),
      };

      await fetch("/api/locations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      await queryClient.invalidateQueries({ queryKey: ["locations"] });
      handleOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>New Location</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <label className="text-sm font-medium leading-none">Name *</label>
            <Input
              required
              value={form.name}
              onChange={field("name")}
              placeholder="The Sunken City"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium leading-none">Type</label>
            <select
              value={form.locationType ?? "other"}
              onChange={field("locationType")}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring cursor-pointer"
            >
              {LOCATION_TYPES.map((t) => (
                <option key={t} value={t} className="bg-background">
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium leading-none">Parent Location</label>
            <select
              value={form.parentLocationId}
              onChange={field("parentLocationId")}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring cursor-pointer"
            >
              <option value="" className="bg-background">— Sin ubicación padre —</option>
              {locations?.map((loc) => (
                <option key={loc.id} value={loc.id} className="bg-background">
                  {loc.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium leading-none">Description</label>
            <Textarea
              value={form.description}
              onChange={field("description")}
              placeholder="Describe this location…"
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving…" : "Create Location"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
