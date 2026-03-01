"use client";

import Link from "next/link";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-[#FAF9F6]">
      {/* This matches your <main className="max-w-3xl mx-auto px-4 ..."> */}
      <div className="max-w-3xl mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* LEFT SIDE - Logo */}
          <Link
            href="/home"
            className="text-lg font-semibold tracking-tight whitespace-nowrap"
          >
            Pregnancy Tracker
          </Link>

          {/* RIGHT SIDE - Navigation */}
          <nav className="flex flex-wrap items-center justify-end gap-x-6 gap-y-2 text-sm">
            <Link href="/calendar" className="hover:text-[#9CAF88]">
              Calendar
            </Link>
            <Link href="/name-generator" className="hover:text-[#9CAF88]">
              Name Generator
            </Link>
            <Link href="/important-dates" className="hover:text-[#9CAF88]">
              Important Dates
            </Link>
            <Link href="/journal" className="hover:text-[#9CAF88]">
              Journal
            </Link>
            <Link href="/memories" className="hover:text-[#9CAF88]">
              Memories
            </Link>
            <Link href="/health" className="hover:text-[#9CAF88]">
              Health
            </Link>
            <Link href="/letters" className="hover:text-[#9CAF88]">
              Letters
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}