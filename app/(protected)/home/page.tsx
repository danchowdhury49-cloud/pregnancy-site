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

  const { data: events } = await supabase
    .from("events")
    .select("*")
    .order("date");

  const nextEvent = getNextEvent(events ?? []);

  const { data: journalEntry } = await supabase
    .from("journal_entries")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="font-serif text-2xl text-text-primary mb-1">
          Welcome back
        </h1>
        <p className="text-text-secondary text-sm">Your pregnancy journey</p>
      </div>

      {/* Countdown & Week Card */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-4xl font-serif font-medium text-sage-600 animate-pulse">
            Week {week}
          </span>
          <span className="px-3 py-1 rounded-full bg-sage-100 text-sage-600 text-sm font-medium">
            {getTrimesterLabel(week)}
          </span>
        </div>
        <p className="text-text-secondary mb-2">
          Due date: {formatDueDate(dueDate)}
        </p>
        <p className="text-2xl font-medium text-text-primary">
          {daysRemaining} days until you meet your baby
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

      {/* Next Event */}
      {nextEvent && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="font-serif text-lg text-text-primary mb-3">
            Next up
          </h2>
          <Link
            href="/calendar"
            className="block p-4 rounded-lg bg-sage-50 hover:bg-sage-100 transition-colors"
          >
            <p className="font-medium text-text-primary">{nextEvent.title}</p>
            <p className="text-sm text-text-secondary">
              {format(new Date(nextEvent.date), "EEEE, MMMM d")}
            </p>
            {nextEvent.description && (
              <p className="text-sm text-text-muted mt-1">{nextEvent.description}</p>
            )}
          </Link>
        </div>
      )}

      {/* Journal Preview */}
      {journalEntry && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="font-serif text-lg text-text-primary mb-3">
            Latest journal entry
          </h2>
          <Link
            href="/journal"
            className="block p-4 rounded-lg bg-sage-50 hover:bg-sage-100 transition-colors"
          >
            <p className="font-medium text-text-primary">{journalEntry.title}</p>
            <p className="text-sm text-text-secondary mt-1 line-clamp-2">
              {journalEntry.content.replace(/<[^>]*>/g, "").slice(0, 150)}
              {journalEntry.content.length > 150 ? "..." : ""}
            </p>
          </Link>
        </div>
      )}

      {!nextEvent && !journalEntry && (
        <div className="bg-white rounded-xl shadow-md p-6 text-center text-text-secondary text-sm">
          <p>Add events in Calendar or start a journal entry.</p>
        </div>
      )}
    </div>
  );
}
