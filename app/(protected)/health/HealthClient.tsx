"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";
import type { WeightLog, Kick, Contraction } from "@/types/database";

interface Props {
  currentWeek: number;
  weightLogs: WeightLog[];
  kicksToday: number;
  contractions: Contraction[];
}

export default function HealthClient({
  currentWeek,
  weightLogs: initialWeightLogs,
  kicksToday: initialKicks,
  contractions: initialContractions,
}: Props) {
  const [weightLogs, setWeightLogs] = useState<WeightLog[]>(initialWeightLogs);
  const [weight, setWeight] = useState("");
  const [week, setWeek] = useState(currentWeek);
  const [weightLoading, setWeightLoading] = useState(false);
  const [kicksToday, setKicksToday] = useState(initialKicks);
  const [kickLoading, setKickLoading] = useState(false);
  const [contractions, setContractions] = useState<Contraction[]>(initialContractions);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerStart, setTimerStart] = useState<Date | null>(null);
  const supabase = createClient();

  const handleAddWeight = async (e: React.FormEvent) => {
    e.preventDefault();
    const w = parseFloat(weight);
    if (isNaN(w)) return;
    setWeightLoading(true);
    try {
      const { data, error } = await supabase
        .from("weight_logs")
        .insert({ week, weight: w })
        .select()
        .single();
      if (!error && data) {
        setWeightLogs((prev) =>
          [...prev, data as WeightLog].sort((a, b) => a.week - b.week)
        );
        setWeight("");
      }
    } finally {
      setWeightLoading(false);
    }
  };

  const handleLogKick = async () => {
    setKickLoading(true);
    try {
      const { error } = await supabase.from("kicks").insert({});
      if (!error) {
        setKicksToday((prev) => prev + 1);
      }
    } finally {
      setKickLoading(false);
    }
  };

  const handleStartTimer = () => {
    setTimerRunning(true);
    setTimerStart(new Date());
  };

  const handleStopTimer = async () => {
    if (!timerStart) return;
    const endTime = new Date();
    const duration = Math.round((endTime.getTime() - timerStart.getTime()) / 1000);
    const { data, error } = await supabase
      .from("contractions")
      .insert({
        start_time: timerStart.toISOString(),
        end_time: endTime.toISOString(),
        duration,
      })
      .select()
      .single();
    if (!error && data) {
      setContractions((prev) => [data as Contraction, ...prev]);
    }
    setTimerRunning(false);
    setTimerStart(null);
  };

  const chartData = weightLogs.map((log) => ({
    week: `W${log.week}`,
    weight: log.weight,
  }));

  return (
    <div className="space-y-6">
      {/* Weight */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="font-serif text-lg text-text-primary mb-4">
          Weight tracking
        </h2>
        <form onSubmit={handleAddWeight} className="flex gap-2 mb-6">
          <input
            type="number"
            step="0.1"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="Weight (kg)"
            className="flex-1 px-4 py-2 rounded-lg border border-sage-200 focus:ring-2 focus:ring-sage-400 outline-none"
          />
          <select
            value={week}
            onChange={(e) => setWeek(parseInt(e.target.value, 10))}
            className="px-4 py-2 rounded-lg border border-sage-200 focus:ring-2 focus:ring-sage-400 outline-none"
          >
            {Array.from({ length: 40 }, (_, i) => i + 1).map((w) => (
              <option key={w} value={w}>
                Week {w}
              </option>
            ))}
          </select>
          <button
            type="submit"
            disabled={weightLoading || !weight}
            className="px-4 py-2 rounded-lg bg-sage-400 text-white hover:bg-sage-500 disabled:opacity-60"
          >
            Add
          </button>
        </form>
        {chartData.length > 0 && (
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8EDE3" />
                <XAxis dataKey="week" stroke="#8A8A8A" fontSize={12} />
                <YAxis stroke="#8A8A8A" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #D4DDCA",
                    borderRadius: "0.5rem",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="weight"
                  stroke="#9CAF88"
                  strokeWidth={2}
                  dot={{ fill: "#9CAF88" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Kick counter */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="font-serif text-lg text-text-primary mb-4">
          Kick counter
        </h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-3xl font-medium text-sage-600">{kicksToday}</p>
            <p className="text-sm text-text-secondary">kicks today</p>
          </div>
          <button
            onClick={handleLogKick}
            disabled={kickLoading}
            className="px-6 py-3 rounded-xl bg-sage-400 text-white font-medium hover:bg-sage-500 transition-colors disabled:opacity-60"
          >
            Log kick
          </button>
        </div>
        <p className="text-xs text-text-muted mt-2">
          Resets daily at midnight
        </p>
      </div>

      {/* Contraction timer */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="font-serif text-lg text-text-primary mb-4">
          Contraction timer
        </h2>
        <div className="flex items-center gap-4 mb-6">
          {!timerRunning ? (
            <button
              onClick={handleStartTimer}
              className="px-6 py-3 rounded-xl bg-sage-400 text-white font-medium hover:bg-sage-500 transition-colors"
            >
              Start
            </button>
          ) : (
            <button
              onClick={handleStopTimer}
              className="px-6 py-3 rounded-xl bg-red-400 text-white font-medium hover:bg-red-500 transition-colors animate-pulse"
            >
              Stop
            </button>
          )}
        </div>
        {contractions.length > 0 && (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            <p className="text-sm font-medium text-text-secondary">
              Recent contractions
            </p>
            {contractions.slice(0, 10).map((c) => (
              <div
                key={c.id}
                className="flex justify-between py-2 border-b border-sage-100 text-sm"
              >
                <span className="text-text-secondary">
                  {format(new Date(c.start_time), "h:mm a")}
                </span>
                <span className="font-medium text-sage-600">
                  {c.duration} sec
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
