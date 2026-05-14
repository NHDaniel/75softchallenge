"use client";
import type { Challenge, Day, WeekStats } from "@/lib/types";

export default function StatsView({
  days, weekStats, challenge
}: {
  days: Day[];
  weekStats: WeekStats[];
  challenge?: Challenge;
}) {
  const total = challenge?.lengthDays ?? 75;
  const completed = days.filter((d) => d.status === "completed").length;
  const failed    = days.filter((d) => d.status === "failed").length;
  const pending   = days.filter((d) => d.status === "pending").length;
  const overall   = total ? Math.round((completed / total) * 100) : 0;

  let best = 0, cur = 0;
  for (const d of days) {
    if (d.status === "completed") { cur++; best = Math.max(best, cur); }
    else if (d.status === "failed") cur = 0;
  }

  return (
    <div className="space-y-4">
      <header>
        <div className="text-[11px] uppercase tracking-[0.18em] text-ink-500 font-bold">Estadísticas</div>
        <h1 className="font-display text-2xl font-extrabold text-ink-900">Tu progreso</h1>
      </header>

      <div className="grid grid-cols-2 gap-3">
        <Big label="Progreso global" value={`${overall}%`} accent />
        <Big label="Mejor streak"    value={`🔥 ${best}`} />
        <Big label="Completados"     value={`${completed}`} sub={`de ${total}`} />
        <Big label="Fallidos"        value={`${failed}`}    sub={`pendientes ${pending}`} />
      </div>

      <section className="card shadow-card p-5">
        <div className="text-[11px] uppercase tracking-[0.18em] text-ink-500 font-bold mb-3">Por semana</div>
        {weekStats.length === 0 && (
          <div className="text-sm text-ink-500 py-6 text-center">Aún no hay datos de semanas.</div>
        )}
        <ul className="space-y-2.5">
          {weekStats.map((s) => (
            <li key={s.weekNumber} className="rounded-2xl bg-canvas-100 border border-ink-200/60 p-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-ink-500 font-bold">Semana</div>
                  <div className="font-display text-lg font-extrabold text-ink-900 leading-tight">#{s.weekNumber}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] uppercase tracking-widest text-ink-500 font-bold">Progreso</div>
                  <div className="font-display text-2xl font-extrabold text-lime-600 leading-none">
                    {Math.round(s.weeklyPct)}%
                  </div>
                </div>
              </div>
              <div className="mt-2 h-2 rounded-full bg-white overflow-hidden">
                <div className="h-full rounded-full"
                  style={{ width: `${s.weeklyPct}%`, background: "linear-gradient(90deg, #A8F04A, #65B70F)" }} />
              </div>
              <div className="mt-2 grid grid-cols-3 gap-2 text-[11px]">
                <span className="text-lime-700 font-bold">✅ {s.daysCompleted}</span>
                <span className="text-rose-500 font-bold text-center">💔 {s.daysFailed}</span>
                <span className="text-ink-700 font-bold text-right">🔥 {s.streakAtWeekEnd}</span>
              </div>
              {s.hardestActivity && (
                <div className="mt-2 text-[11px] text-ink-600">
                  Más difícil: <b>{s.hardestActivity}</b>
                </div>
              )}
              {s.motivationalMsg && (
                <div className="mt-1 text-[11px] italic text-ink-500">{s.motivationalMsg}</div>
              )}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function Big({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: boolean }) {
  return (
    <div className={`card shadow-soft p-4 ${accent ? "bg-gradient-to-br from-lime-100 to-canvas-50" : ""}`}>
      <div className="text-[10px] uppercase tracking-widest text-ink-500 font-bold">{label}</div>
      <div className={`font-display text-2xl font-extrabold ${accent ? "text-lime-700" : "text-ink-900"} mt-0.5`}>{value}</div>
      {sub && <div className="text-[11px] text-ink-500 mt-0.5">{sub}</div>}
    </div>
  );
}
