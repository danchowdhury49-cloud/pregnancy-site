"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const navItems = [
  { href: "/home", label: "Home" },
  { href: "/calendar", label: "Calendar" },
  { href: "/important-dates", label: "Important Dates" },
  { href: "/journal", label: "Journal" },
  { href: "/memories", label: "Memories" },
  { href: "/health", label: "Health" },
  { href: "/letters", label: "Letters" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-sage-100 shadow-sm">
      <div className="max-w-3xl mx-auto px-4">
        <div className="flex items-center justify-between h-14 min-w-0">
          <Link
            href="/home"
            className="font-serif text-lg font-medium text-text-primary hover:text-sage-500 transition-colors flex-shrink-0"
          >
            Pregnancy Tracker
          </Link>
          <div className="flex gap-1 overflow-x-auto scrollbar-hide flex-1 justify-end min-w-0">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  pathname === item.href
                    ? "bg-sage-100 text-sage-600"
                    : "text-text-secondary hover:bg-sage-50 hover:text-text-primary"
                }`}
              >
                {item.label}
              </Link>
            ))}
            <button
              onClick={handleSignOut}
              className="px-3 py-2 rounded-lg text-sm text-text-secondary hover:bg-sage-50 hover:text-text-primary transition-colors ml-2 whitespace-nowrap flex-shrink-0"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
