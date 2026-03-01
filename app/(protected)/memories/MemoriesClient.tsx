"use client";

import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { format } from "date-fns";
import type { Memory } from "@/types/database";

interface Props {
  memories: Memory[];
}

export default function MemoriesClient({ memories: initialMemories }: Props) {
  const [memories, setMemories] = useState<Memory[]>(initialMemories);
  const [preview, setPreview] = useState<Memory | null>(null);
  const [editing, setEditing] = useState<Memory | null>(null);
  const [caption, setCaption] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null);

    const file = e.target.files?.[0];
    // allow re-selecting the same file
    e.target.value = "";
    if (!file) return;

    // basic validation
    if (!file.type.startsWith("image/")) {
      setErrorMsg("Please select an image file.");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setErrorMsg("Image is too large (max 8MB).");
      return;
    }

    setLoading(true);

    try {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `public/${crypto.randomUUID()}.${ext}`;

      // Upload to Storage (requires bucket/policies – see notes below)
      const { error: uploadError } = await supabase.storage
        .from("memories")
        .upload(path, file, { upsert: false, contentType: file.type });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from("memories")
        .getPublicUrl(path);

      const publicUrl = publicUrlData?.publicUrl;
      if (!publicUrl) throw new Error("Could not generate public URL.");

      const { data, error } = await supabase
        .from("memories")
        .insert({ image_url: publicUrl, caption: null })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setMemories((prev) => [data as Memory, ...prev]);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "Upload failed. Check console for details.");
      console.error("Memory upload error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCaption = async () => {
    if (!editing) return;
    setLoading(true);
    setErrorMsg(null);

    try {
      const { error } = await supabase
        .from("memories")
        .update({ caption: caption || null })
        .eq("id", editing.id);

      if (error) throw error;

      setMemories((prev) =>
        prev.map((m) => (m.id === editing.id ? { ...m, caption } : m))
      );
      setEditing(null);
      setPreview(null);
    } catch (err: any) {
      setErrorMsg(err?.message || "Could not save caption.");
      console.error("Save caption error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this memory?")) return;

    setLoading(true);
    setErrorMsg(null);

    try {
      const { error } = await supabase.from("memories").delete().eq("id", id);
      if (error) throw error;

      setMemories((prev) => prev.filter((m) => m.id !== id));
      setPreview(null);
      setEditing(null);
    } catch (err: any) {
      setErrorMsg(err?.message || "Could not delete memory.");
      console.error("Delete memory error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleUpload}
        className="hidden"
      />

      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={loading}
        className="w-full py-3 rounded-xl border-2 border-dashed border-sage-200 text-sage-600 hover:bg-sage-50 transition-colors disabled:opacity-60"
      >
        {loading ? "Uploading..." : "+ Upload photo"}
      </button>

      {errorMsg && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {memories.map((memory) => (
          <button
            key={memory.id}
            onClick={() => {
              setPreview(memory);
              setCaption(memory.caption ?? "");
            }}
            className="aspect-square relative rounded-xl overflow-hidden bg-sage-100 shadow-md hover:shadow-lg transition-shadow"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={memory.image_url}
              alt={memory.caption ?? "Memory"}
              className="w-full h-full object-cover"
            />
            {memory.caption && (
              <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/50 text-white text-xs line-clamp-2">
                {memory.caption}
              </div>
            )}
          </button>
        ))}
      </div>

      {preview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <button
            className="absolute inset-0"
            onClick={() => {
              setPreview(null);
              setEditing(null);
            }}
          />
          <div className="relative max-w-2xl w-full">
            <div className="relative aspect-video rounded-xl overflow-hidden bg-black">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={preview.image_url}
                alt={preview.caption ?? "Memory"}
                className="w-full h-full object-contain"
              />
            </div>

            <div className="mt-4 bg-white rounded-xl p-4">
              {editing?.id === preview.id ? (
                <div className="space-y-2">
                  <textarea
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    rows={2}
                    placeholder="Add a caption..."
                    className="w-full px-3 py-2 rounded-lg border border-sage-200 focus:ring-2 focus:ring-sage-400 outline-none resize-none"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveCaption}
                      disabled={loading}
                      className="flex-1 py-2 rounded-lg bg-sage-400 text-white hover:bg-sage-500 disabled:opacity-60"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditing(null)}
                      className="py-2 px-4 rounded-lg border border-sage-200 text-text-secondary"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex justify-between items-center gap-4">
                  <p className="text-text-primary">
                    {preview.caption || "No caption"}
                  </p>
                  <p className="text-sm text-text-muted whitespace-nowrap">
                    {format(new Date(preview.created_at), "MMM d, yyyy")}
                  </p>
                </div>
              )}

              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => setEditing(preview)}
                  className="text-sm text-sage-600 hover:text-sage-500"
                >
                  {editing?.id === preview.id ? "Editing..." : "Edit caption"}
                </button>
                <button
                  onClick={() => handleDelete(preview.id)}
                  className="text-sm text-red-500 hover:text-red-400"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}