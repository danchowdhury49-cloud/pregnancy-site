import { createClient } from "@/lib/supabase/server";
import MemoriesClient from "./MemoriesClient";

export default async function MemoriesPage() {
  const supabase = await createClient();
  const { data: memories } = await supabase
    .from("memories")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h1 className="font-serif text-2xl text-text-primary">Memories</h1>
        <p className="text-text-secondary text-sm mt-1">
          Your pregnancy photo gallery
        </p>
      </div>
      <MemoriesClient memories={memories ?? []} />
    </div>
  );
}
