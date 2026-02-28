"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function UnlockPage() {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/home";

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data?.error || "Incorrect passcode");
        return;
      }

      router.replace(next);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6] px-4">
      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center">
        <h1 className="text-2xl font-semibold tracking-tight">Pregnancy Site</h1>
        <p className="mt-2 text-sm text-gray-600">
          Enter the passcode to continue.
        </p>

        <form
          onSubmit={onSubmit}
          className="mt-6 rounded-xl border bg-white p-4 shadow-sm"
        >
          <label className="text-sm text-gray-600">Passcode</label>
          <input
            type="password"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="mt-2 w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-black/10"
            placeholder="••••••••"
            autoFocus
          />

          {error && <div className="mt-3 text-sm text-red-600">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="mt-4 w-full rounded-lg bg-black px-3 py-2 text-sm font-medium text-white hover:bg-black/90 disabled:opacity-60"
          >
            {loading ? "Checking..." : "Unlock"}
          </button>
        </form>
      </div>
    </div>
  );
}