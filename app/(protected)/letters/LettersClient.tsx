"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { format } from "date-fns";
import type { Letter } from "@/types/database";

interface Props {
  letters: Letter[];
}

export default function LettersClient({ letters: initialLetters }: Props) {
  const [letters, setLetters] = useState<Letter[]>(initialLetters);
  const [editing, setEditing] = useState<Letter | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const supabase = createClient();

  const resetForm = () => {
    setEditing(null);
    setIsNew(false);
    setTitle("");
    setContent("");
  };

  const handleEdit = (l: Letter) => {
    setEditing(l);
    setTitle(l.title);
    setContent(l.content);
    setIsNew(false);
  };

  const handleNew = () => {
    resetForm();
    setIsNew(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editing) {
        const { error } = await supabase
          .from("letters")
          .update({ title, content })
          .eq("id", editing.id);
        if (!error) {
          setLetters((prev) =>
            prev.map((l) =>
              l.id === editing.id ? { ...l, title, content } : l
            )
          );
          resetForm();
        }
      } else if (isNew) {
        const { data, error } = await supabase
          .from("letters")
          .insert({ title, content })
          .select()
          .single();
        if (!error && data) {
          setLetters((prev) => [data as Letter, ...prev]);
          resetForm();
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this letter?")) return;
    const { error } = await supabase.from("letters").delete().eq("id", id);
    if (!error) {
      setLetters((prev) => prev.filter((l) => l.id !== id));
      resetForm();
      setExpanded(null);
    }
  };

  return (
    <div className="space-y-4">
      <button
        onClick={handleNew}
        className="w-full py-3 rounded-xl bg-sage-400 text-white font-medium hover:bg-sage-500 transition-colors"
      >
        + New letter
      </button>

      <div className="space-y-3">
        {letters.map((letter) => (
          <div
            key={letter.id}
            className="bg-white rounded-xl shadow-md overflow-hidden"
          >
            <button
              onClick={() =>
                setExpanded((p) => (p === letter.id ? null : letter.id))
              }
              className="w-full p-5 text-left hover:bg-sage-50/50 transition-colors"
            >
              <p className="font-serif font-medium text-text-primary">
                {letter.title}
              </p>
              <p className="text-xs text-text-muted mt-1">
                {format(new Date(letter.created_at), "MMMM d, yyyy")}
              </p>
              <p className="text-sm text-text-secondary mt-2 line-clamp-2">
                {letter.content.slice(0, 120)}
                {letter.content.length > 120 ? "..." : ""}
              </p>
            </button>
            {expanded === letter.id && (
              <div className="px-5 pb-5 border-t border-sage-100 pt-4">
                <p className="text-text-secondary whitespace-pre-wrap leading-relaxed font-serif text-base">
                  {letter.content}
                </p>
                <div className="flex gap-4 mt-4">
                  <button
                    onClick={() => handleEdit(letter)}
                    className="text-sm text-sage-600 hover:text-sage-500"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(letter.id)}
                    className="text-sm text-red-500 hover:text-red-400"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {(editing || isNew) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
          <div className="absolute inset-0" onClick={resetForm} />
          <div className="relative bg-white rounded-xl shadow-lg max-w-lg w-full max-h-[90vh] overflow-y-auto p-6">
            <h2 className="font-serif text-lg text-text-primary mb-4">
              {isNew ? "New letter" : "Edit letter"}
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
                  placeholder="Dear baby..."
                  className="w-full px-4 py-2 rounded-lg border border-sage-200 focus:ring-2 focus:ring-sage-400 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Content
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={10}
                  placeholder="Write your heart out..."
                  className="w-full px-4 py-2 rounded-lg border border-sage-200 focus:ring-2 focus:ring-sage-400 outline-none resize-y font-serif text-base leading-relaxed"
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
              {editing && (
                <button
                  type="button"
                  onClick={() => handleDelete(editing.id)}
                  disabled={loading}
                  className="w-full py-2 text-red-500 hover:bg-red-50 rounded-lg mt-2"
                >
                  Delete letter
                </button>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
