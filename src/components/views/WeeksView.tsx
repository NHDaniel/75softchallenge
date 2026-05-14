"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import type { Day, WeekStats } from "@/lib/types";
import { groupByWeek, isFuture, isToday, weekIndexOf, dayOfWeekLabel, fmtDate } from "@/lib/dates";

export default function WeeksView({
  days, weekStats, onOpenDay
}: {
  days: Day[];
  weekStats: WeekStats[];
  onOpenDay: (id: number) => void;
}) {
  const weeks = useMemo(() => groupByWeek(days), [days]);
  const todayDay = days.find((d) => isToday(d.date));
  const initialWeek = todayDay ? weekIndexOf(todayDay.dayNumber) : 0;
  const [active, setActive] = useState<number>(initialWeek);
  const stripRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setActive(initialWeek);
  }, [initialWeek]);

  useEffect(() => {
    const el = stripRef.current?.querySelector<HTMLElement>(`[data-week="${active}"]`);
    el?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [active]);

  const week = weeks[active] ?? [];
  const stats = weekStats[active];

  return (
    <div className="space-y-4">
      <header className="flex items-end justify-between">
        <div>
          <div className="text-[11px] uppercase tracking-[0.18em] text-ink-500 font-bold">Calendario</div>
          <h1 className="font-display text-2xl font-extrabold text-ink-900">Semanas del reto</h1>
        </div>
        <button
          onClick={() => setActive(initialWeek)}
          className="rounded-full bg-lime-300 text-ink-900 font-bold text-sm px-3.5 py-1.5 shadow-soft active:scale-95 transition"
        >
          Hoy
        </button>
      </header>

      {/* Week selector */}
      <div ref={stripRef} className="-mx-4 px-4 overflow-x-auto no-scrollbar">
        <div className="flex gap-2 min-w-max">
          {weeks.map((_, i) => {
            const p = Math.round(weekStats[i]?.weeklyPct ?? 0);
            const isActive = i === active;
            return (
              <button
                key={i}
                data-week={i}
                onClick={() => setActive(i)}
                className={`shrink-0 rounded-2xl px-3.5 py-2 border transition ${
                  isActive
                    ? "bg-ink-900 text-canvas-50 border-ink-900 shadow-card"
                    : "bg-white border-ink-200 text-ink-700 hover:border-lime-300"
                }`}
              >
                <div className={`text-[10px] uppercase tracking-widest ${isActive ? "text-lime-300" : "text-ink-500"} font-bold`}>
                  Semana
                </div>
                <div className="font-extrabold text-base leading-tight">{i + 1}</div>
                <div className={`text-[10px] font-mono ${isActive ? "text-canvas-200" : "text-ink-500"}`}>{p}%</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active week */}
      {week.length > 0 && (
        <motion.section
          key={active}
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="card shadow-card p-4 sm:p-5"
        >
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-[10px] uppercase tracking-widest text-ink-500 font-bold">
                {fmtDate(week[0].date)} → {fmtDate(week[week.length - 1].date)}
              </div>
              <div className="font-display text-xl font-extrabold text-ink-900">Semana {active + 1}</div>
            </div>
            {stats && (
              <div className="text-right">
                <div className="text-[10px] uppercase tracking-widest text-ink-500 font-bold">Progreso</div>
                <div className="text-2xl font-display font-extrabold text-lime-600 leading-none">
                  {Math.round(stats.weeklyPct)}%
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-7 gap-1.5">
            {week.map((d) => (
              <DayCell key={d.id} day={d} onClick={() => onOpenDay(d.id)} />
            ))}
          </div>

          {stats && (
            <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
              <Mini icon="✅" label="Hechos"     value={stats.daysCompleted} color="text-lime-600" />
              <Mini icon="💔" label="Fallidos"   value={stats.daysFailed}    color="text-rose-500" />
              <Mini icon="🔥" label="Streak"     value={stats.streakAtWeekEnd} />
            </div>
          )}

          {stats?.motivationalMsg && (
            <p className="mt-3 text-sm text-ink-600 italic text-center">{stats.motivationalMsg}</p>
          )}
        </motion.section>
      )}
    </div>
  );
}

function DayCell({ day, onClick }: { day: Day; onClick: () => void }) {
  const today = isToday(day.date);
  const future = isFuture(day.date);
  let bg = "bg-canvas-100 border-ink-200";
  let badge = "⏳";
  let badgeBg = "bg-canvas-200 text-ink-600";

  if (today) {
    bg = "bg-lime-100 border-lime-400 ring-2 ring-lime-300 animate-pulseGlow";
    badge = "•";
    badgeBg = "bg-lime-400 text-ink-900";
  } else if (future) {
    bg = "bg-canvas-100 border-ink-200/50 opacity-60";
    badge = "🔒";
    badgeBg = "bg-canvas-200 text-ink-500";
  } else if (day.status === "completed") {
    bg = "bg-lime-50 border-lime-300";
    badge = "✓";
    badgeBg = "bg-lime-400 text-ink-900";
  } else if (day.status === "failed") {
    bg = "bg-rose-50 border-rose-200";
    badge = "✕";
    badgeBg = "bg-rose-200 text-rose-700";
  }

  return (
    <motion.button
      whileTap={{ scale: 0.94 }} whileHover={{ y: -2 }}
      onClick={onClick}
      className={`relative h-[88px] rounded-2xl p-2 border text-left overflow-hidden ${bg}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-[9px] uppercase tracking-wider text-ink-500 font-bold">
          {dayOfWeekLabel(day.date).slice(0, 1)}
        </span>
        <span className={`grid place-items-center w-4 h-4 rounded-full text-[10px] font-bold ${badgeBg}`}>
          {badge}
        </span>
      </div>
      <div className="mt-1 font-display font-extrabold text-base leading-none text-ink-900">
        {day.dayNumber}
      </div>
      <div className="text-[9px] font-mono text-ink-500 mt-0.5">{fmtDate(day.date)}</div>
      {!future && day.completionPct > 0 && (
        <div className="absolute left-2 right-2 bottom-1.5 h-1 rounded-full bg-white/70 overflow-hidden">
          <div
            className="h-full rounded-full"
            style={{
              width: `${Math.min(100, day.completionPct)}%`,
              background: day.status === "failed"
                ? "linear-gradient(90deg, #FFD1DC, #F08AA0)"
                : "linear-gradient(90deg, #A8F04A, #65B70F)"
            }}
          />
        </div>
      )}
    </motion.button>
  );
}

function Mini({ icon, label, value, color }: { icon: string; label: string; value: number; color?: string }) {
  return (
    <div className="rounded-xl bg-canvas-100 border border-ink-200/60 px-3 py-2">
      <div className="text-[10px] uppercase tracking-widest text-ink-500 font-bold">{icon} {label}</div>
      <div className={`text-base font-extrabold ${color ?? "text-ink-900"}`}>{value}</div>
    </div>
  );
}
