import { createClient } from "@/lib/supabase/server";
import ImportantDatesClient from "./ImportantDatesClient";

export default async function ImportantDatesPage() {
  const supabase = await createClient();
  const { data: dates } = await supabase
    .from("important_dates")
    .select("*")
    .order("date");

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h1 className="font-serif text-2xl text-text-primary">Important Dates</h1>
        <p className="text-text-secondary text-sm mt-1">
          First ultrasound, baby shower & milestones
        </p>
      </div>
      <ImportantDatesClient dates={dates ?? []} />
    </div>
  );
}
