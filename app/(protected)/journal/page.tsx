import { createClient } from "@/lib/supabase/server";
import JournalClient from "./JournalClient";
import { calculateCurrentWeek } from "@/lib/pregnancyUtils";
import { getDueDate } from "@/lib/pregnancyUtils";

export default async function JournalPage() {
  const supabase = await createClient();
  const { data: entries } = await supabase
    .from("journal_entries")
    .select("*")
    .order("created_at", { ascending: false });

  const dueDate = getDueDate();
  const currentWeek = calculateCurrentWeek(dueDate);

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h1 className="font-serif text-2xl text-text-primary">Journal</h1>
        <p className="text-text-secondary text-sm mt-1">
          Weekly reflections on your journey
        </p>
      </div>
      <JournalClient entries={entries ?? []} currentWeek={currentWeek} />
    </div>
  );
}
