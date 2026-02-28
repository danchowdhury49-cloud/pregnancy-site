"use client";

import { useMemo, useState } from "react";

const BOY_NAMES = [
  "Noah","Oliver","George","Leo","Arthur","Harry","Charlie","Theo","Oscar","Freddie",
  "Jack","Alfie","Henry","Archie","Finley","Felix","Jude","Hugo","Louis","Milo",
];

const GIRL_NAMES = [
  "Olivia","Amelia","Isla","Ava","Mia","Ivy","Freya","Lily","Grace","Sophie",
  "Ella","Evie","Poppy","Ruby","Charlotte","Florence","Matilda","Willow","Aria","Elsie",
];

function pickTwoDistinct(list: string[]): [string, string] {
  const a = list[Math.floor(Math.random() * list.length)];
  let b = list[Math.floor(Math.random() * list.length)];
  while (b === a && list.length > 1) b = list[Math.floor(Math.random() * list.length)];
  return [a, b];
}

export default function NameGeneratorPage() {
  const [mode, setMode] = useState<"boy" | "girl" | "either">("either");

  const activeList = useMemo(() => {
    if (mode === "boy") return BOY_NAMES;
    if (mode === "girl") return GIRL_NAMES;
    return [...BOY_NAMES, ...GIRL_NAMES];
  }, [mode]);

  const [pair, setPair] = useState<[string, string]>(() => pickTwoDistinct(activeList));
  const [shortlist, setShortlist] = useState<string[]>([]);

  function generate() {
    setPair(pickTwoDistinct(activeList));
  }

  function addToShortlist(name: string) {
    setShortlist((prev) => (prev.includes(name) ? prev : [name, ...prev]));
  }

  function removeFromShortlist(name: string) {
    setShortlist((prev) => prev.filter((n) => n !== name));
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-serif text-xl text-text-primary">Name Generator</h1>
            <p className="mt-1 text-sm text-text-muted">
              Tap generate for two names. Add favorites to your shortlist.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setMode("either")}
              className={`px-3 py-1.5 rounded-lg text-sm ${
                mode === "either" ? "bg-sage-400 text-white" : "bg-sage-50 text-text-secondary hover:bg-sage-100"
              }`}
            >
              Either
            </button>
            <button
              onClick={() => setMode("boy")}
              className={`px-3 py-1.5 rounded-lg text-sm ${
                mode === "boy" ? "bg-sage-400 text-white" : "bg-sage-50 text-text-secondary hover:bg-sage-100"
              }`}
            >
              Boy
            </button>
            <button
              onClick={() => setMode("girl")}
              className={`px-3 py-1.5 rounded-lg text-sm ${
                mode === "girl" ? "bg-sage-400 text-white" : "bg-sage-50 text-text-secondary hover:bg-sage-100"
              }`}
            >
              Girl
            </button>
          </div>
        </div>

        <div className="mt-6 grid sm:grid-cols-2 gap-4">
          {pair.map((name) => (
            <div key={name} className="rounded-xl border border-sage-200 p-4 flex items-center justify-between">
              <div className="text-lg font-medium text-text-primary">{name}</div>
              <button
                onClick={() => addToShortlist(name)}
                className="px-3 py-1.5 rounded-lg bg-sage-50 text-sage-700 hover:bg-sage-100 text-sm"
              >
                + Shortlist
              </button>
            </div>
          ))}
        </div>

        <button
          onClick={generate}
          className="mt-5 w-full py-3 rounded-xl bg-sage-400 text-white font-medium hover:bg-sage-500 transition-colors"
        >
          Generate new names
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="font-serif text-lg text-text-primary">Shortlist</h2>

        {shortlist.length === 0 ? (
          <p className="mt-2 text-sm text-text-muted">No names yet — add a few favorites above.</p>
        ) : (
          <ul className="mt-4 space-y-2">
            {shortlist.map((name) => (
              <li key={name} className="flex items-center justify-between rounded-lg border border-sage-100 p-3">
                <span className="text-text-primary">{name}</span>
                <button
                  onClick={() => removeFromShortlist(name)}
                  className="text-sm text-red-500 hover:text-red-600"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}