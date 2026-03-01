"use client";

import Link from "next/link";
import { useState } from "react";

const navLinks = [
  { href: "/calendar", label: "Calendar" },
  { href: "/name-generator", label: "Name Generator" },
  { href: "/important-dates", label: "Important Dates" },
  { href: "/journal", label: "Journal" },
  { href: "/memories", label: "Memories" },
  { href: "/health", label: "Health" },
  { href: "/letters", label: "Letters" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-[#FAF9F6]">
      <div className="flex h-16 items-center justify-between px-6 sm:px-8">
        {/* LEFT SIDE - Logo */}
        <Link
          href="/home"
          className="text-lg font-semibold tracking-tight whitespace-nowrap"
          onClick={() => setOpen(false)}
        >
          Pregnancy Tracker
        </Link>

        {/* DESKTOP NAV */}
        <nav className="hidden md:flex items-center gap-6 text-sm">
          {navLinks.map((l) => (
            <Link key={l.href} href={l.href} className="hover:text-[#9CAF88]">
              {l.label}
            </Link>
          ))}
        </nav>

        {/* MOBILE MENU BUTTON */}
        <button
          type="button"
          className="md:hidden inline-flex items-center justify-center rounded-lg border border-sage-200 px-3 py-2 text-sm hover:bg-sage-50"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label="Toggle menu"
        >
          {open ? "Close" : "Menu"}
        </button>
      </div>

      {/* MOBILE DROPDOWN */}
      {open && (
        <div className="md:hidden border-t border-sage-100 bg-[#FAF9F6]">
          <nav className="px-6 sm:px-8 py-3 flex flex-col gap-2 text-sm">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="py-2 hover:text-[#9CAF88]"
                onClick={() => setOpen(false)}
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}