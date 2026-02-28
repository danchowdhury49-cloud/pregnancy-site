"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { format } from "date-fns";
import type { ImportantDate } from "@/types/database";

interface Props {
  dates: ImportantDate[];
}

export default function ImportantDatesClient({ dates: initialDates }: Props) {
  const [dates, setDates] = useState<ImportantDate[]>(initialDates);
  const [editing, setEditing] = useState<ImportantDate | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const resetForm = () => {
    setEditing(null);
    setIsNew(false);
    setTitle("");
    setDescription("");
    setDate("");
  };

  const handleEdit = (d: ImportantDate) => {
    setEditing(d);
    setTitle(d.title);
    setDescription(d.description ?? "");
    setDate(d.date);
    setIsNew(false);
  };

  const handleNew = () => {
    resetForm();
    setIsNew(true);
    setDate(new Date().toISOString().split("T")[0]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editing) {
        const { error } = await supabase
          .from("important_dates")
          .update({ title, description: description || null, date })
          .eq("id", editing.id);
        if (!error) {
          setDates((prev) =>
            prev
              .map((d) =>
                d.id === editing.id
                  ? { ...d, title, description: description || null, date }
                  : d
              )
              .sort((a, b) => a.date.localeCompare(b.date))
          );
          resetForm();
        }
      } else if (isNew) {
        const { data, error } = await supabase
          .from("important_dates")
          .insert({ title, description: description || null, date })
          .select()
          .single();
        if (!error && data) {
          setDates((prev) =>
            [...prev, data as ImportantDate].sort((a, b) => a.date.localeCompare(b.date))
          );
          resetForm();
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this date?")) return;
    const { error } = await supabase.from("important_dates").delete().eq("id", id);
    if (!error) {
      setDates((prev) => prev.filter((d) => d.id !== id));
      resetForm();
    }
  };

  return (
    <div className="space-y-4">
      <button
        onClick={handleNew}
        className="w-full py-3 rounded-xl border-2 border-dashed border-sage-200 text-sage-600 hover:bg-sage-50 transition-colors"
      >
        + Add important date
      </button>

      <div className="space-y-3">
        {dates.map((d) => (
          <div
            key={d.id}
            className="bg-white rounded-xl shadow-md p-5 relative group"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-text-primary">{d.title}</p>
                <p className="text-sm text-text-secondary mt-0.5">
                  {format(new Date(d.date + "T12:00:00"), "EEEE, MMMM d, yyyy")}
                </p>
                {d.description && (
                  <p className="text-sm text-text-muted mt-2">{d.description}</p>
                )}
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleEdit(d)}
                  className="text-sm text-sage-600 hover:text-sage-500"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(d.id)}
                  className="text-sm text-red-500 hover:text-red-400"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {(editing || isNew) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
          <div
            className="absolute inset-0"
            onClick={resetForm}
          />
          <div className="relative bg-white rounded-xl shadow-lg max-w-md w-full p-6">
            <h2 className="font-serif text-lg text-text-primary mb-4">
              {isNew ? "Add important date" : "Edit important date"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full px-4 py-2 rounded-lg border border-sage-200 focus:ring-2 focus:ring-sage-400 outline-none"
                  placeholder="e.g. First ultrasound"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="w-full px-4 py-2 rounded-lg border border-sage-200 focus:ring-2 focus:ring-sage-400 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Description (optional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 rounded-lg border border-sage-200 focus:ring-2 focus:ring-sage-400 outline-none resize-none"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 py-2 rounded-lg border border-sage-200 text-text-secondary hover:bg-sage-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2 rounded-lg bg-sage-400 text-white hover:bg-sage-500 disabled:opacity-60"
                >
                  {loading ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
