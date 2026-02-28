"use client";

import { useState, useEffect } from "react";
import type { Event, EventType } from "@/types/database";

interface EventModalProps {
  date: string;
  events: Event[];
  onClose: () => void;
  onSave: (event: Partial<Event>) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
}

export default function EventModal({
  date,
  events,
  onClose,
  onSave,
  onDelete,
}: EventModalProps) {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<EventType>("personal");
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setSelectedEvent(null);
    setIsEditing(false);
    setTitle("");
    setDescription("");
    setType("personal");
  };

  const handleEdit = (event: Event) => {
    setSelectedEvent(event);
    setIsEditing(true);
    setTitle(event.title);
    setDescription(event.description ?? "");
    setType(event.type);
  };

  const handleNew = () => {
    resetForm();
    setIsEditing(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave({
        id: selectedEvent?.id,
        title,
        description: description || null,
        date: selectedEvent?.date ?? date,
        type,
      });
      resetForm();
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = async () => {
    if (selectedEvent && onDelete) {
      if (confirm("Delete this event?")) {
        setLoading(true);
        try {
          await onDelete(selectedEvent.id);
          resetForm();
          onClose();
        } finally {
          setLoading(false);
        }
      }
    }
  };

  const types: EventType[] = ["appointment", "milestone", "personal"];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
      <div
        className="absolute inset-0"
        onClick={() => !isEditing && onClose()}
      />
      <div className="relative bg-white rounded-xl shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto p-6">
        <h2 className="font-serif text-xl text-text-primary mb-2">
          {new Date(date + "T12:00:00").toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </h2>

        {!isEditing ? (
          <div className="space-y-3">
            {events.map((event) => (
              <div
                key={event.id}
                className="p-4 rounded-lg bg-sage-50 border border-sage-100"
              >
                <p className="font-medium text-text-primary">{event.title}</p>
                <p className="text-sm text-text-secondary capitalize">{event.type}</p>
                {event.description && (
                  <p className="text-sm text-text-muted mt-1">{event.description}</p>
                )}
                <button
                  onClick={() => handleEdit(event)}
                  className="mt-2 text-sm text-sage-600 hover:text-sage-500"
                >
                  Edit
                </button>
              </div>
            ))}
            <button
              onClick={handleNew}
              className="w-full py-3 rounded-lg border-2 border-dashed border-sage-200 text-sage-600 hover:bg-sage-50 transition-colors"
            >
              + Add event
            </button>
            <button
              onClick={onClose}
              className="w-full py-2 text-text-secondary hover:text-text-primary"
            >
              Close
            </button>
          </div>
        ) : (
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
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as EventType)}
                className="w-full px-4 py-2 rounded-lg border border-sage-200 focus:ring-2 focus:ring-sage-400 outline-none"
              >
                {types.map((t) => (
                  <option key={t} value={t}>
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </option>
                ))}
              </select>
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
            {selectedEvent && onDelete && (
              <button
                type="button"
                onClick={handleDeleteClick}
                disabled={loading}
                className="w-full py-2 text-red-500 hover:bg-red-50 rounded-lg"
              >
                Delete event
              </button>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
