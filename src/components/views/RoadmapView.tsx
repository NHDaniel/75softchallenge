"use client";
import { motion } from "framer-motion";
import type { Day } from "@/lib/types";
import { isFuture, isToday } from "@/lib/dates";

export default function RoadmapView({
  days, onOpenDay
}: { days: Day[]; onOpenDay: (id: number) => void }) {
  const total = days.length || 75;
  const done = days.filter((d) => d.status === "completed").length;
  const failed = days.filter((d) => d.status === "failed").length;

  // best streak so far
  let best = 0, cur = 0;
  for (const d of days) {
    if (d.status === "completed") { cur++; best = Math.max(best, cur); }
    else if (d.status === "failed") cur = 0;
  }

  const donePct = (done / total) * 100;
  const failedPct = (failed / total) * 100;

  return (
    <div className="space-y-4">
      <header>
        <div className="text-[11px] uppercase tracking-[0.18em] text-ink-500 font-bold">Roadmap</div>
        <h1 className="font-display text-2xl font-extrabold text-ink-900">75 días · progresión</h1>
      </header>

      {/* Headline progress */}
      <div className="card shadow-card p-5 relative overflow-hidden">
        <div className="pointer-events-none absolute -top-12 -right-12 w-44 h-44 rounded-full bg-lime-200/60 blur-2xl" />
        <div className="flex items-end justify-between gap-3">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-ink-500 font-bold">Completado</div>
            <div className="font-display text-4xl font-extrabold text-lime-600 leading-none">
              {done}<span className="text-ink-400 text-2xl">/{total}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-widest text-ink-500 font-bold">Mejor streak</div>
            <div className="font-display text-2xl font-extrabold text-ink-900">🔥 {best}</div>
          </div>
        </div>

        <div className="mt-4">
          <div className="flex justify-between text-[10px] text-ink-500 font-mono mb-1.5">
            <span>0</span><span>15</span><span>30</span><span>45</span><span>60</span><span>75</span>
          </div>
          <div className="h-3 rounded-full bg-canvas-200 overflow-hidden flex">
            <div className="h-full" style={{
              width: `${donePct}%`,
              background: "linear-gradient(90deg, #A8F04A, #65B70F)",
              boxShadow: "0 2px 10px rgba(134,217,32,0.5)"
            }} />
            <div className="h-full" style={{
              width: `${failedPct}%`,
              background: "linear-gradient(90deg, #FFD1DC, #F08AA0)"
            }} />
          </div>
        </div>
      </div>

      {/* 75-day grid */}
      <div className="card shadow-card p-4">
        <div className="grid gap-1.5" style={{ gridTemplateColumns: "repeat(10, minmax(0, 1fr))" }}>
          {days.map((d, i) => {
            const today = isToday(d.date);
            const future = isFuture(d.date);
            let bg = "bg-canvas-100";
            if (d.status === "completed") bg = "bg-lime-400 shadow-soft";
            else if (d.status === "failed") bg = "bg-rose-300";
            else if (today) bg = "bg-lime-200 ring-2 ring-lime-400 animate-pulseGlow";
            else if (future) bg = "bg-canvas-100 opacity-50";

            return (
              <motion.button
                key={d.id}
                onClick={() => onOpenDay(d.id)}
                whileHover={{ scale: 1.25, zIndex: 5 }}
                whileTap={{ scale: 0.92 }}
                transition={{ type: "spring", stiffness: 320, damping: 20 }}
                title={`Día ${d.dayNumber}`}
                className={`relative aspect-square rounded-lg ${bg} flex items-center justify-center`}
              >
                <span className="text-[9px] font-bold text-ink-800/70">{d.dayNumber}</span>
                {(i + 1) % 10 === 0 && (
                  <span className="absolute -bottom-3.5 right-0 text-[9px] font-mono text-ink-400">{i + 1}</span>
                )}
              </motion.button>
            );
          })}
        </div>

        <Legend />
      </div>
    </div>
  );
}

function Legend() {
  return (
    <div className="mt-5 flex flex-wrap items-center gap-3 text-[11px] text-ink-600">
      <Lg color="bg-lime-400" label="completado" />
      <Lg color="bg-rose-300" label="fallido" />
      <Lg color="bg-lime-200 ring-1 ring-lime-400" label="hoy" />
      <Lg color="bg-canvas-100 opacity-60 border border-ink-200" label="futuro" />
    </div>
  );
}
function Lg({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`inline-block w-3.5 h-3.5 rounded ${color}`} />
      <span>{label}</span>
    </span>
  );
}
