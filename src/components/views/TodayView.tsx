"use client";
import { motion } from "framer-motion";
import useSWR, { mutate } from "swr";
import { api } from "@/lib/api";
import type { Activity, Challenge, Day } from "@/lib/types";
import { dayOfWeekLabel, fmtDate, activityAppliesOn } from "@/lib/dates";
import type { TabKey } from "../BottomTabs";

export default function TodayView({
  challenge, day, activities, allDays, onOpenDay, onGoTab
}: {
  challenge?: Challenge;
  day?: Day;
  activities: Activity[];
  allDays: Day[];
  onOpenDay: (id: number) => void;
  onGoTab: (t: TabKey) => void;
}) {
  const detail = useSWR(day ? ["day", day.id] : null, () => api.day(day!.id));

  // Solo las actividades aplicables al día de la semana de HOY
  const todayActivities = day
    ? activities.filter((a) => activityAppliesOn(a.weekdays, day.date))
    : [];

  const completed = allDays.filter((d) => d.status === "completed").length;
  const failed    = allDays.filter((d) => d.status === "failed").length;
  const total     = challenge?.lengthDays ?? 75;
  const overall   = Math.round((completed / total) * 100);
  const streak    = day?.streakAtDay ?? 0;

  const logsByActivity = new Map(detail.data?.logs.map((l) => [l.activityId, l]) ?? []);
  const doneCount = todayActivities.filter((a) => logsByActivity.get(a.id)?.completed).length;
  const dayPct = todayActivities.length ? Math.round((doneCount / todayActivities.length) * 100) : 0;

  const toggleLog = async (a: Activity) => {
    if (!day) return;
    const existing = logsByActivity.get(a.id);
    const next = !(existing?.completed ?? false);
    await api.upsertLog(day.id, {
      activityId: a.id,
      completed: next,
      valueDone: next ? a.targetValue : 0
    });
    mutate(["day", day.id]);
    mutate("days");
    mutate("weekStats");
  };

  return (
    <div className="space-y-5">
      {/* Greeting card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="card shadow-card p-5 sm:p-6 relative overflow-hidden"
      >
        <div className="pointer-events-none absolute -top-12 -right-10 w-44 h-44 rounded-full bg-lime-200/60 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-10 w-40 h-40 rounded-full bg-mint/60 blur-2xl" />

        <div className="relative flex items-start gap-4">
          <div className="text-4xl animate-floaty">🌿</div>
          <div className="flex-1 min-w-0">
            <div className="text-[11px] uppercase tracking-[0.18em] text-ink-500 font-bold">
              {day ? dayOfWeekLabel(day.date) : "—"} · {day ? fmtDate(day.date) : ""}
            </div>
            <h1 className="font-display text-[28px] sm:text-3xl font-extrabold leading-tight text-ink-900 mt-0.5">
              Hola 👋
            </h1>
            <p className="text-ink-600 text-sm mt-0.5">
              {day
                ? <>Hoy es <b className="text-lime-600">Día {day.dayNumber}</b> de {total}</>
                : "Configurando tu reto…"}
            </p>
          </div>
          <BigRing pct={overall} label={`${completed}/${total}`} />
        </div>

        <div className="mt-5 grid grid-cols-3 gap-2">
          <Stat icon="🔥" label="Streak"      value={`${streak}`} />
          <Stat icon="✅" label="Completados" value={`${completed}`} />
          <Stat icon="💔" label="Fallidos"    value={`${failed}`} />
        </div>
      </motion.div>

      {/* Today's checklist */}
      <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="card shadow-card p-5"
      >
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-[11px] uppercase tracking-[0.18em] text-ink-500 font-bold">Checklist de hoy</div>
            <h2 className="font-display text-xl font-extrabold text-ink-900">Tus hábitos</h2>
          </div>
          <DayProgress pct={dayPct} />
        </div>

        <ul className="space-y-2">
          {todayActivities.map((a) => {
            const l = logsByActivity.get(a.id);
            const done = !!l?.completed;
            return (
              <motion.li key={a.id} whileTap={{ scale: 0.98 }}>
                <button
                  onClick={() => toggleLog(a)}
                  className={`w-full text-left rounded-2xl px-3.5 py-3 border flex items-center gap-3 transition ${
                    done
                      ? "bg-lime-50 border-lime-300 shadow-soft"
                      : "bg-white border-ink-200 hover:border-lime-300 hover:bg-lime-50/40"
                  }`}
                >
                  <span className={`grid place-items-center w-10 h-10 rounded-xl text-xl ${done ? "bg-lime-300" : "bg-canvas-100"}`}>
                    {a.icon}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-ink-900 truncate">{a.name}</div>
                    <div className="text-xs text-ink-500 font-mono">
                      meta {a.targetValue} {a.targetUnit}
                      {l && <> · {new Date(l.loggedAt).toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" })}</>}
                    </div>
                  </div>
                  <Check done={done} />
                </button>
              </motion.li>
            );
          })}
          {todayActivities.length === 0 && (
            <div className="text-sm text-ink-500 py-6 text-center">
              No hay actividades para hoy.
            </div>
          )}
        </ul>

        {day && (
          <button
            onClick={() => onOpenDay(day.id)}
            className="mt-4 w-full rounded-2xl bg-ink-900 text-canvas-50 font-bold py-3 active:scale-[0.99] transition"
          >
            Abrir resumen del día →
          </button>
        )}
      </motion.div>

      {/* Quick nav */}
      <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="grid grid-cols-3 gap-2"
      >
        <NavTile icon="🗓️" label="Semanas" onClick={() => onGoTab("weeks")} />
        <NavTile icon="🛣️" label="Roadmap" onClick={() => onGoTab("roadmap")} />
        <NavTile icon="📊" label="Stats"   onClick={() => onGoTab("stats")} />
      </motion.div>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-canvas-100 border border-ink-200/60 px-3 py-2.5">
      <div className="text-[10px] uppercase tracking-widest text-ink-500 font-bold">{icon} {label}</div>
      <div className="text-lg font-extrabold text-ink-900 mt-0.5">{value}</div>
    </div>
  );
}

function NavTile({ icon, label, onClick }: { icon: string; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="card shadow-soft py-4 flex flex-col items-center gap-1 active:scale-[0.97] transition"
    >
      <span className="text-2xl">{icon}</span>
      <span className="text-xs font-bold text-ink-700">{label}</span>
    </button>
  );
}

function BigRing({ pct, label }: { pct: number; label: string }) {
  const r = 30, c = 2 * Math.PI * r;
  const dash = (Math.max(0, Math.min(100, pct)) / 100) * c;
  return (
    <div className="relative w-20 h-20 shrink-0">
      <svg viewBox="0 0 80 80" className="-rotate-90 w-20 h-20">
        <circle cx="40" cy="40" r={r} stroke="#EDF2E0" strokeWidth="8" fill="none" />
        <circle cx="40" cy="40" r={r} stroke="url(#g1)" strokeWidth="8" strokeLinecap="round"
          fill="none" strokeDasharray={`${dash} ${c - dash}`}
        />
        <defs>
          <linearGradient id="g1" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%"  stopColor="#A8F04A" />
            <stop offset="100%" stopColor="#65B70F" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <div className="text-center leading-none">
          <div className="text-base font-extrabold text-ink-900">{pct}%</div>
          <div className="text-[9px] text-ink-500 font-mono">{label}</div>
        </div>
      </div>
    </div>
  );
}

function DayProgress({ pct }: { pct: number }) {
  return (
    <div className="text-right">
      <div className="text-[10px] uppercase tracking-widest text-ink-500 font-bold">Hoy</div>
      <div className="text-2xl font-display font-extrabold text-lime-600 leading-none">{pct}%</div>
    </div>
  );
}

function Check({ done }: { done: boolean }) {
  return (
    <span className={`grid place-items-center w-7 h-7 rounded-full border-2 transition ${
      done ? "bg-lime-400 border-lime-500 shadow-glow" : "bg-white border-ink-300"
    }`}>
      {done && (
        <svg viewBox="0 0 24 24" className="w-4 h-4 text-ink-900" fill="none" stroke="currentColor" strokeWidth="3">
          <motion.path
            d="M5 12.5l4.5 4.5L19 7.5"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.3 }}
            strokeLinecap="round" strokeLinejoin="round"
          />
        </svg>
      )}
    </span>
  );
}
