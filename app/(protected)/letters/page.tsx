import { createClient } from "@/lib/supabase/server";
import LettersClient from "./LettersClient";

export default async function LettersPage() {
  const supabase = await createClient();
  const { data: letters } = await supabase
    .from("letters")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h1 className="font-serif text-2xl text-text-primary">
          Letters to Baby
        </h1>
        <p className="text-text-secondary text-sm mt-1">
          Private notes for your little one
        </p>
      </div>
      <LettersClient letters={letters ?? []} />
    </div>
  );
}
