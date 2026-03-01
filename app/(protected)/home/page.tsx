import { createClient } from "@/lib/supabase/server";
import {
  calculateCurrentWeek,
  calculateDaysRemaining,
  getTrimesterLabel,
  getNextEvent,
  getDueDate,
  formatDueDate,
} from "@/lib/pregnancyUtils";
import { babyData } from "@/lib/babyData";
import Link from "next/link";
import { format } from "date-fns";

export default async function HomePage() {
  const supabase = await createClient();

  const dueDate = getDueDate();
  const week = calculateCurrentWeek(dueDate);
  const daysRemaining = calculateDaysRemaining(dueDate);
  const baby = babyData[week] ?? babyData[40];

  const { data: events } = await supabase.from("events").select("*").order("date");
  const nextEvent = getNextEvent(events ?? []);

  const { data: journalEntry } = await supabase
    .from("journal_entries")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return (
    <main className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <header className="py-10 text-center">
        <h1 className="font-serif text-3xl text-text-primary">Welcome back</h1>
        <p className="mt-2 text-sm text-text-secondary">Our pregnancy journey</p>
      </header>

      {/* Grid: 1 col on mobile, 2 col on desktop */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* LEFT COLUMN */}
        <div className="space-y-6">
          {/* Countdown & Week Card */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <p className="text-4xl font-serif font-medium text-sage-600">
                  Week {week}
                </p>
                <p className="mt-2 text-text-secondary">
                  Due date: {formatDueDate(dueDate)}
                </p>
              </div>

              <span className="shrink-0 px-3 py-1 rounded-full bg-sage-100 text-sage-600 text-sm font-medium">
                {getTrimesterLabel(week)}
              </span>
            </div>

            <p className="text-2xl font-medium text-text-primary">
              {daysRemaining} days until we meet our baby
            </p>
          </div>

          {/* Baby Size */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="font-serif text-lg text-text-primary mb-2">Baby size</h2>
            <p className="text-sage-600 font-medium text-lg mb-1">{baby.size}</p>
            <p className="text-text-secondary text-sm leading-relaxed">
              {baby.development}
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-6">
          {/* Next Event */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-serif text-lg text-text-primary">Next up</h2>
              <Link
                href="/calendar"
                className="text-sm text-sage-600 hover:underline"
              >
                View calendar
              </Link>
            </div>

            {nextEvent ? (
              <Link
                href="/calendar"
                className="block p-4 rounded-lg bg-sage-50 hover:bg-sage-100 transition-colors"
              >
                <p className="font-medium text-text-primary">{nextEvent.title}</p>
                <p className="text-sm text-text-secondary">
                  {format(new Date(nextEvent.date), "EEEE, MMMM d")}
                </p>
                {nextEvent.description && (
                  <p className="text-sm text-text-muted mt-1">
                    {nextEvent.description}
                  </p>
                )}
              </Link>
            ) : (
              <div className="rounded-lg border border-sage-100 bg-sage-50 p-4 text-sm text-text-secondary">
                No upcoming events yet. Add one in{" "}
                <Link href="/calendar" className="text-sage-600 hover:underline">
                  Calendar
                </Link>
                .
              </div>
            )}
          </div>

          {/* Journal Preview */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-serif text-lg text-text-primary">
                Latest journal entry
              </h2>
              <Link
                href="/journal"
                className="text-sm text-sage-600 hover:underline"
              >
                View journal
              </Link>
            </div>

            {journalEntry ? (
              <Link
                href="/journal"
                className="block p-4 rounded-lg bg-sage-50 hover:bg-sage-100 transition-colors"
              >
                <p className="font-medium text-text-primary">{journalEntry.title}</p>
                <p className="text-sm text-text-secondary mt-1 line-clamp-3">
                  {journalEntry.content.replace(/<[^>]*>/g, "").slice(0, 180)}
                  {journalEntry.content.length > 180 ? "..." : ""}
                </p>
              </Link>
            ) : (
              <div className="rounded-lg border border-sage-100 bg-sage-50 p-4 text-sm text-text-secondary">
                No journal entries yet. Start one in{" "}
                <Link href="/journal" className="text-sage-600 hover:underline">
                  Journal
                </Link>
                .
              </div>
            )}
          </div>
        </div>

        {/* Optional combined empty state if BOTH missing */}
        {!nextEvent && !journalEntry && (
          <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-6 text-center text-text-secondary text-sm">
            <p>Add events in Calendar or start a journal entry.</p>
          </div>
        )}
      </section>
    </main>
  );
}