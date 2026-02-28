"use client";

import { useEffect, useMemo, useRef, useState } from "react";

/**
 * OPTION 1: BIG LISTS IN CODE (YOU CAN EXPAND THESE)
 * Add hundreds/thousands here whenever you want.
 */
const BOY_NAMES = [
  "Noah","Oliver","George","Leo","Arthur","Harry","Charlie","Theo","Oscar","Freddie",
  "Jack","Alfie","Henry","Archie","Finley","Felix","Jude","Hugo","Louis","Milo",
  // Add more...
];

const GIRL_NAMES = [
  "Olivia","Amelia","Isla","Ava","Mia","Ivy","Freya","Lily","Grace","Sophie",
  "Ella","Evie","Poppy","Ruby","Charlotte","Florence","Matilda","Willow","Aria","Elsie",
  // Add more...
];

/** Fisher–Yates shuffle */
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Creates a "deck" of names that we draw from.
 * This prevents repeats until the deck is exhausted.
 */
function buildDeck(mode: "boy" | "girl" | "either") {
    const clean = (list: string[]) =>
      list.filter((n) => n && n.trim().length > 0);
  
    if (mode === "boy") return shuffle(clean(BOY_NAMES));
    if (mode === "girl") return shuffle(clean(GIRL_NAMES));
    return shuffle([...clean(BOY_NAMES), ...clean(GIRL_NAMES)]);
  }

export default function NameGeneratorPage() {
  const [mode, setMode] = useState<"boy" | "girl" | "either">("either");

  // The shuffled deck and the current index into it.
  const deckRef = useRef<string[]>([]);
  const indexRef = useRef<number>(0);

  const [pair, setPair] = useState<[string, string]>(["Loading...", "Loading..."]);
  const [shortlist, setShortlist] = useState<string[]>([]);

  // Build/reset the deck whenever mode changes.
  useEffect(() => {
    deckRef.current = buildDeck(mode);
    indexRef.current = 0;

    // Immediately generate the first pair.
    generatePair();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  function nextName(): string {
    // If deck is empty, just return placeholder
    if (deckRef.current.length === 0) return "—";

    // If we’ve reached the end, reshuffle and restart (still no repeats within each cycle)
    if (indexRef.current >= deckRef.current.length) {
      deckRef.current = shuffle(deckRef.current);
      indexRef.current = 0;
    }

    const name = deckRef.current[indexRef.current];
    indexRef.current += 1;
    return name;
  }

  function generatePair() {
    if (deckRef.current.length < 2) {
      setPair(["No names available", ""]);
      return;
    }
  
    const a = nextName();
    const b = nextName();
  
    setPair([a, b]);
  }

  function addToShortlist(name: string) {
    if (!name || name === "—") return;
    setShortlist((prev) => (prev.includes(name) ? prev : [name, ...prev]));
  }

  function removeFromShortlist(name: string) {
    setShortlist((prev) => prev.filter((n) => n !== name));
  }

  const modeButtons = useMemo(
    () => [
      { key: "either" as const, label: "Either" },
      { key: "boy" as const, label: "Boy" },
      { key: "girl" as const, label: "Girl" },
    ],
    []
  );

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="font-serif text-xl text-text-primary">Name Generator</h1>
            <p className="mt-1 text-sm text-text-muted">
              Tap generate for two names. Add favourites to your shortlist.
            </p>
          </div>

          <div className="flex gap-2">
            {modeButtons.map((b) => (
              <button
                key={b.key}
                onClick={() => setMode(b.key)}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  mode === b.key
                    ? "bg-sage-400 text-white"
                    : "bg-sage-50 text-text-secondary hover:bg-sage-100"
                }`}
              >
                {b.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 grid sm:grid-cols-2 gap-4">
          {pair.map((name) => (
            <div
              key={name}
              className="rounded-xl border border-sage-200 p-4 flex items-center justify-between"
            >
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
          onClick={generatePair}
          className="mt-5 w-full py-3 rounded-xl bg-sage-400 text-white font-medium hover:bg-sage-500 transition-colors"
        >
          Generate new names
        </button>

        <p className="mt-3 text-xs text-text-muted">
          Tip: add more names by extending the BOY_NAMES and GIRL_NAMES arrays at the top of this file.
          This generator won’t repeat names until it has cycled through the whole list.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="font-serif text-lg text-text-primary">Shortlist</h2>

        {shortlist.length === 0 ? (
          <p className="mt-2 text-sm text-text-muted">No names yet — add a few favourites above.</p>
        ) : (
          <ul className="mt-4 space-y-2">
            {shortlist.map((name) => (
              <li
                key={name}
                className="flex items-center justify-between rounded-lg border border-sage-100 p-3"
              >
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