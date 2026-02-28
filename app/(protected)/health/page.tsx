import { createClient } from "@/lib/supabase/server";
import HealthClient from "./HealthClient";
import { calculateCurrentWeek } from "@/lib/pregnancyUtils";
import { getDueDate } from "@/lib/pregnancyUtils";

export default async function HealthPage() {
  const supabase = await createClient();
  const dueDate = getDueDate();
  const currentWeek = calculateCurrentWeek(dueDate);

  const { data: weightLogs } = await supabase
    .from("weight_logs")
    .select("*")
    .order("week");

  const today = new Date().toISOString().split("T")[0];
  const { data: kicks } = await supabase
    .from("kicks")
    .select("*")
    .gte("timestamp", `${today}T00:00:00`)
    .lte("timestamp", `${today}T23:59:59`);

  const { data: contractions } = await supabase
    .from("contractions")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(20);

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h1 className="font-serif text-2xl text-text-primary">Health</h1>
        <p className="text-text-secondary text-sm mt-1">
          Weight, kicks & contractions
        </p>
      </div>
      <HealthClient
        currentWeek={currentWeek}
        weightLogs={weightLogs ?? []}
        kicksToday={(kicks ?? []).length}
        contractions={contractions ?? []}
      />
    </div>
  );
}
