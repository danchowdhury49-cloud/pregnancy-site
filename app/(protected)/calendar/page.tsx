import { createClient } from "@/lib/supabase/server";
import CalendarPageClient from "./CalendarPageClient";

export default async function CalendarPage() {
  const supabase = await createClient();
  const { data: events } = await supabase
    .from("events")
    .select("*")
    .order("date");

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h1 className="font-serif text-2xl text-text-primary">Calendar</h1>
        <p className="text-text-secondary text-sm mt-1">
          Doctor appointments, milestones & events
        </p>
      </div>
      <CalendarPageClient events={events ?? []} />
    </div>
  );
}
