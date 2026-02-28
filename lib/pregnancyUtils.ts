import { format, addDays, differenceInDays, startOfDay, parseISO } from "date-fns";
import type { Event } from "@/types/database";

export function calculateCurrentWeek(dueDate: Date | string): number {
  const due = typeof dueDate === "string" ? parseISO(dueDate) : dueDate;
  const today = startOfDay(new Date());
  const dueDay = startOfDay(due);
  const daysSinceStart = 280 - differenceInDays(dueDay, today);
  
  if (daysSinceStart <= 0) return 40;
  if (daysSinceStart > 280) return 1;
  
  return Math.min(40, Math.max(1, Math.ceil(daysSinceStart / 7)));
}

export function calculateDaysRemaining(dueDate: Date | string): number {
  const due = typeof dueDate === "string" ? parseISO(dueDate) : dueDate;
  const today = startOfDay(new Date());
  const dueDay = startOfDay(due);
  return Math.max(0, differenceInDays(dueDay, today));
}

export function getTrimester(week: number): 1 | 2 | 3 {
  if (week <= 12) return 1;
  if (week <= 27) return 2;
  return 3;
}

export function getTrimesterLabel(week: number): string {
  const tri = getTrimester(week);
  return `Trimester ${tri}`;
}

export function getNextEvent(events: Event[]): Event | null {
  const today = startOfDay(new Date()).toISOString().split("T")[0];
  const futureEvents = events
    .filter((e) => e.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date));
  return futureEvents[0] ?? null;
}

export function getDueDate(): Date {
  const envDate = process.env.NEXT_PUBLIC_DUE_DATE;
  if (envDate) {
    return parseISO(envDate);
  }
  return addDays(new Date(), 140);
}

export function formatDueDate(date: Date | string): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, "MMMM d, yyyy");
}
