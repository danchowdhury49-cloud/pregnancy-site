"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Calendar from "@/components/Calendar";
import EventModal from "@/components/EventModal";
import type { Event } from "@/types/database";

interface Props {
  events: Event[];
}

export default function CalendarPageClient({ events: initialEvents }: Props) {
  const [events, setEvents] = useState<Event[]>(initialEvents);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const supabase = createClient();

  const dateEvents = selectedDate
    ? events.filter((e) => e.date === selectedDate)
    : [];

  const handleSave = async (event: Partial<Event>) => {
    if (event.id) {
      const { error } = await supabase
        .from("events")
        .update({
          title: event.title,
          description: event.description,
          type: event.type,
        })
        .eq("id", event.id);
      if (!error) {
        setEvents((prev) =>
          prev.map((e) =>
            e.id === event.id
              ? { ...e, title: event.title!, description: event.description ?? null, type: event.type! }
              : e
          )
        );
      }
    } else {
      const { data, error } = await supabase
        .from("events")
        .insert({
          title: event.title,
          description: event.description,
          date: event.date,
          type: event.type,
        })
        .select()
        .single();
      if (!error && data) {
        setEvents((prev) => [...prev, data as Event].sort((a, b) => a.date.localeCompare(b.date)));
      }
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("events").delete().eq("id", id);
    if (!error) {
      setEvents((prev) => prev.filter((e) => e.id !== id));
    }
  };

  return (
    <>
      <Calendar events={events} onDateClick={(date) => setSelectedDate(date)} />
      {selectedDate && (
        <EventModal
          date={selectedDate}
          events={dateEvents}
          onClose={() => setSelectedDate(null)}
          onSave={handleSave}
          onDelete={handleDelete}
        />
      )}
    </>
  );
}
