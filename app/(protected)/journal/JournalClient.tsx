"use client";

import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import { format } from "date-fns";
import type { JournalEntry } from "@/types/database";

type Mood = "happy" | "tired" | "emotional" | "excited";

interface Props {
  entries: JournalEntry[];
  currentWeek: number;
}

const MOOD_LABELS: Record<Mood, string> = {
  happy: "😊 Happy",
  tired: "😴 Tired",
  emotional: "🥺 Emotional",
  excited: "✨ Excited",
};

function todayYMD() {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

export default function JournalClient({ entries: initialEntries, currentWeek }: Props) {
  const [entries, setEntries] = useState<JournalEntry[]>(initialEntries);
  const [editing, setEditing] = useState<JournalEntry | null>(null);
  const [isNew, setIsNew] = useState(false);

  const [week, setWeek] = useState(currentWeek);
  const [date, setDate] = useState<string>(todayYMD()); // ✅ NEW: required by DB
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [mood, setMood] = useState<Mood>("happy");
  const [loading, setLoading] = useState(false);

  const supabase = createClient();

  const suggestedTitle = `Week ${week} – Feeling the kicks`;

  const resetForm = () => {
    setEditing(null);
    setIsNew(false);
    setWeek(currentWeek);
    setDate(todayYMD()); // ✅ reset date
    setTitle("");
    setContent("");
    setMood("happy");
  };

  const handleEdit = (e: JournalEntry) => {
    setEditing(e);
    setWeek((e as any).week ?? currentWeek);
    setTitle((e as any).title ?? "");
    setContent((e as any).content ?? "");
    setMood(((e as any).mood as Mood) ?? "happy");
    // ✅ keep stored date if present; otherwise default to today
    setDate(((e as any).date as string) || todayYMD());
    setIsNew(false);
  };

  const handleNew = () => {
    resetForm();
    setTitle(suggestedTitle);
    setIsNew(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const finalTitle = title.trim() || suggestedTitle;
      const safeDate = date && date.trim().length > 0 ? date : todayYMD();

const payload = {
  week,
  date: safeDate,
  title: finalTitle,
  content,
  mood,
};

      if (editing) {
        const { error } = await supabase
          .from("journal_entries")
          .update(payload)
          .eq("id", (editing as any).id);

        if (error) {
          console.error(error);
          alert("Failed to update entry");
          return;
        }

        setEntries((prev) =>
          prev.map((en) => ((en as any).id === (editing as any).id ? ({ ...(en as any), ...payload } as any) : en))
        );
        resetForm();
        return;
      }

      if (isNew) {
        const { data, error } = await supabase
          .from("journal_entries")
          .insert(payload)
          .select()
          .single();

        if (error) {
          console.error(error);
          alert("Failed to create entry");
          return;
        }

        if (data) {
          setEntries((prev) => [data as JournalEntry, ...prev]);
          resetForm();
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this journal entry?")) return;

    const { error } = await supabase.from("journal_entries").delete().eq("id", id);

    if (error) {
      console.error(error);
      alert("Failed to delete entry");
      return;
    }

    setEntries((prev) => prev.filter((en) => (en as any).id !== id));
    resetForm();
  };

  const moods: Mood[] = ["happy", "tired", "emotional", "excited"];

  return (
    <div className="space-y-4">
      <button
        onClick={handleNew}
        className="w-full py-3 rounded-xl bg-sage-400 text-white font-medium hover:bg-sage-500 transition-colors"
      >
        + New journal entry
      </button>

      <div className="space-y-4">
        {entries.map((entry) => (
          <div key={(entry as any).id} className="bg-white rounded-xl shadow-md p-5 group">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-text-primary">{(entry as any).title}</p>
                <p className="text-xs text-text-muted mt-1">
                  Week {(entry as any).week} • {format(new Date((entry as any).created_at), "MMM d, yyyy")}
                </p>
                <span className="inline-block mt-2 px-2 py-0.5 rounded-full bg-sage-100 text-sage-600 text-xs">
                  {MOOD_LABELS[((entry as any).mood as Mood) ?? "happy"]}
                </span>
                <p
                  className="text-sm text-text-secondary mt-3 line-clamp-3 whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{
                    __html: String((entry as any).content ?? "").replace(/<[^>]*>/g, ""),
                  }}
                />
              </div>

              <button
                onClick={() => handleEdit(entry)}
                className="text-sm text-sage-600 hover:text-sage-500 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                Edit
              </button>
            </div>
          </div>
        ))}
      </div>

      {(editing || isNew) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
          <div className="absolute inset-0" onClick={resetForm} />
          <div className="relative bg-white rounded-xl shadow-lg max-w-lg w-full max-h-[90vh] overflow-y-auto p-6">
            <h2 className="font-serif text-lg text-text-primary mb-4">
              {isNew ? "New journal entry" : "Edit journal entry"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* ✅ NEW: Date field (keeps DB happy + lets you change it if you want) */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-sage-200 focus:ring-2 focus:ring-sage-400 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Week</label>
                <input
                  type="number"
                  min={1}
                  max={40}
                  value={week}
                  onChange={(e) => {
                    const w = parseInt(e.target.value, 10);
                    setWeek(w);
                    if (!editing && !title) setTitle(`Week ${w} – Feeling the kicks`);
                  }}
                  className="w-full px-4 py-2 rounded-lg border border-sage-200 focus:ring-2 focus:ring-sage-400 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={suggestedTitle}
                  className="w-full px-4 py-2 rounded-lg border border-sage-200 focus:ring-2 focus:ring-sage-400 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Mood</label>
                <div className="flex flex-wrap gap-2">
                  {moods.map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setMood(m)}
                      className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                        mood === m
                          ? "bg-sage-400 text-white"
                          : "bg-sage-50 text-text-secondary hover:bg-sage-100"
                      }`}
                    >
                      {MOOD_LABELS[m]}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Content</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={8}
                  placeholder="How are you feeling this week? What milestones happened?"
                  className="w-full px-4 py-2 rounded-lg border border-sage-200 focus:ring-2 focus:ring-sage-400 outline-none resize-y"
                />
                <p className="text-xs text-text-muted mt-1">Basic formatting: use **bold** for bold text</p>
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

              {editing && (
                <button
                  type="button"
                  onClick={() => handleDelete((editing as any).id)}
                  disabled={loading}
                  className="w-full py-2 text-red-500 hover:bg-red-50 rounded-lg"
                >
                  Delete entry
                </button>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}