import { Suspense } from "react";
import UnlockClient from "./UnlockClient";

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FAF9F6]" />}>
      <UnlockClient />
    </Suspense>
  );
}