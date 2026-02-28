"use client";

import { useMemo, useState } from "react";
import Calendar from "@/components/Calendar";
import EventModal from "@/components/EventModal";
import type { Event } from "@/types/database";
import { createClient } from "@/lib/supabase/client";

export default function CalendarPageClient({ events: initialEvents }: { events: Event[] }) {
  const supabase = createClient();

  const [events, setEvents] = useState<Event[]>(initialEvents);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const eventsForSelectedDate = useMemo(() => {
    if (!selectedDate) return [];
    return events.filter((e) => e.date === selectedDate);
  }, [events, selectedDate]);

  async function refetchEvents() {
    const { data, error } = await supabase.from("events").select("*").order("date");
    if (error) {
      console.error(error);
      return;
    }
    setEvents((data ?? []) as Event[]);
  }

  async function handleSave(payload: Partial<Event>) {
    // If payload has an id -> update, else insert
    if (payload.id) {
      const { error } = await supabase
        .from("events")
        .update({
          title: payload.title,
          description: payload.description ?? null,
          type: payload.type,
          date: payload.date,
        })
        .eq("id", payload.id);

      if (error) {
        console.error(error);
        alert("Failed to update event");
        return;
      }
    } else {
      const { error } = await supabase.from("events").insert({
        title: payload.title,
        description: payload.description ?? null,
        type: payload.type,
        date: payload.date,
      });

      if (error) {
        console.error(error);
        alert("Failed to create event");
        return;
      }
    }

    await refetchEvents();
  }

  async function handleDelete(id: string) {
    const { error } = await supabase.from("events").delete().eq("id", id);
    if (error) {
      console.error(error);
      alert("Failed to delete event");
      return;
    }
    await refetchEvents();
  }

  return (
    <>
      <Calendar
        events={events}
        onDateClick={(date) => {
          setSelectedDate(date);
        }}
      />

      {selectedDate && (
        <EventModal
          date={selectedDate}
          events={eventsForSelectedDate}
          onClose={() => setSelectedDate(null)}
          onSave={handleSave}
          onDelete={handleDelete}
        />
      )}
    </>
  );
}