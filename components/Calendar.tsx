"use client";

import { useState } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
} from "date-fns";
import type { Event } from "@/types/database";

interface CalendarProps {
  events: Event[];
  onDateClick: (date: string) => void;
}

export default function Calendar({ events, onDateClick }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const days: Date[] = [];
  let day = calendarStart;
  while (day <= calendarEnd) {
    days.push(day);
    day = addDays(day, 1);
  }

  const getEventsForDate = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return events.filter((e) => e.date === dateStr);
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-sage-100">
        <button
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          className="p-2 rounded-lg hover:bg-sage-50 text-sage-600 transition-colors"
        >
          ←
        </button>
        <h2 className="font-serif text-lg text-text-primary">
          {format(currentMonth, "MMMM yyyy")}
        </h2>
        <button
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="p-2 rounded-lg hover:bg-sage-50 text-sage-600 transition-colors"
        >
          →
        </button>
      </div>

      <div className="grid grid-cols-7 text-center text-xs text-text-muted border-b border-sage-100">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d} className="py-2 font-medium">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {days.map((day) => {
          const dayEvents = getEventsForDate(day);
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isToday = isSameDay(day, new Date());

          return (
            <button
              key={day.toISOString()}
              onClick={() => onDateClick(format(day, "yyyy-MM-dd"))}
              className={`min-h-[4rem] p-2 border-b border-r border-sage-100 hover:bg-sage-50 transition-colors text-left ${
                !isCurrentMonth ? "text-sage-300 bg-sage-50/30" : "text-text-primary"
              } ${isToday ? "bg-sage-100 font-medium" : ""}`}
            >
              <span className="text-sm">{format(day, "d")}</span>
              {dayEvents.length > 0 && (
                <div className="mt-1 flex flex-wrap gap-1">
                  {dayEvents.slice(0, 2).map((e) => (
                    <span
                      key={e.id}
                      className="w-2 h-2 rounded-full bg-sage-400"
                      title={e.title}
                    />
                  ))}
                  {dayEvents.length > 2 && (
                    <span className="text-xs text-text-muted">+{dayEvents.length - 2}</span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
