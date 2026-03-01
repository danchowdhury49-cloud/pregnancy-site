"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const BOY_NAMES = [
  "Noah","Oliver","George","Leo","Arthur","Harry","Charlie","Theo","Oscar","Freddie",
  "Jack","Alfie","Henry","Archie","Finley","Felix","Jude","Hugo","Louis","Milo",
];

const GIRL_NAMES = [
  "Olivia","Amelia","Isla","Ava","Mia","Ivy","Freya","Lily","Grace","Sophie",
  "Ella","Evie","Poppy","Ruby","Charlotte","Florence","Matilda","Willow","Aria","Elsie",
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function clean(list: string[]) {
  return list.map((n) => (n ?? "").trim()).filter(Boolean);
}

function buildDeck(mode: "boy" | "girl" | "either") {
  if (mode === "boy") return shuffle(clean(BOY_NAMES));
  if (mode === "girl") return shuffle(clean(GIRL_NAMES));
  return shuffle([...clean(BOY_NAMES), ...clean(GIRL_NAMES)]);
}

export default function NameGeneratorPage() {
  const [mode, setMode] = useState<"boy" | "girl" | "either">("either");

  const deckRef = useRef<string[]>([]);
  const idxRef = useRef(0);

  // ✅ Exactly TWO names, always
  const [a, setA] = useState<string>("—");
  const [b, setB] = useState<string>("—");

  const [shortlist, setShortlist] = useState<string[]>([]);

  const modeButtons = useMemo(
    () => [
      { key: "either" as const, label: "Either" },
      { key: "boy" as const, label: "Boy" },
      { key: "girl" as const, label: "Girl" },
    ],
    []
  );

  function nextName(): string {
    if (deckRef.current.length === 0) return "—";

    if (idxRef.current >= deckRef.current.length) {
      deckRef.current = shuffle(deckRef.current);
      idxRef.current = 0;
    }

    const name = deckRef.current[idxRef.current] ?? "—";
    idxRef.current += 1;
    return name;
  }

  function generateTwo() {
    // draw first
    const first = nextName();

    // draw second (ensure different when possible)
    let second = nextName();
    let guard = 0;
    while (deckRef.current.length >= 2 && second === first && guard < 10) {
      second = nextName();
      guard++;
    }

    setA(first);
    setB(second);
  }

  useEffect(() => {
    deckRef.current = buildDeck(mode);
    idxRef.current = 0;
    generateTwo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  function addToShortlist(name: string) {
    if (!name || name === "—") return;
    setShortlist((prev) => (prev.includes(name) ? prev : [name, ...prev]));
  }

  function removeFromShortlist(name: string) {
    setShortlist((prev) => prev.filter((n) => n !== name));
  }

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
            {modeButtons.map((btn) => (
              <button
                key={btn.key}
                onClick={() => setMode(btn.key)}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  mode === btn.key
                    ? "bg-sage-400 text-white"
                    : "bg-sage-50 text-text-secondary hover:bg-sage-100"
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>

        {/* ✅ EXACTLY TWO CARDS, SIDE BY SIDE */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-xl border border-sage-200 p-4 flex items-center justify-between">
            <div className="text-lg font-medium text-text-primary">{a}</div>
            <button
              onClick={() => addToShortlist(a)}
              className="px-3 py-1.5 rounded-lg bg-sage-50 text-sage-700 hover:bg-sage-100 text-sm"
            >
              + Shortlist
            </button>
          </div>

          <div className="rounded-xl border border-sage-200 p-4 flex items-center justify-between">
            <div className="text-lg font-medium text-text-primary">{b}</div>
            <button
              onClick={() => addToShortlist(b)}
              className="px-3 py-1.5 rounded-lg bg-sage-50 text-sage-700 hover:bg-sage-100 text-sm"
            >
              + Shortlist
            </button>
          </div>
        </div>

        <button
          onClick={generateTwo}
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