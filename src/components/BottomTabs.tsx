"use client";
import { motion } from "framer-motion";

export type TabKey = "today" | "weeks" | "roadmap" | "stats";

const TABS: { key: TabKey; label: string; icon: string }[] = [
  { key: "today",   label: "Hoy",     icon: "🌿" },
  { key: "weeks",   label: "Semanas", icon: "🗓️" },
  { key: "roadmap", label: "75 días", icon: "🛣️" },
  { key: "stats",   label: "Stats",   icon: "📊" }
];

export default function BottomTabs({
  current, onChange
}: { current: TabKey; onChange: (t: TabKey) => void }) {
  return (
    <nav
      className="fixed left-0 right-0 bottom-0 z-40 px-3 pb-[max(0.75rem,var(--safe-bottom))] pt-2"
      style={{ background: "linear-gradient(180deg, transparent, rgba(252,254,247,0.85) 35%, #FCFEF7 70%)" }}
    >
      <div className="max-w-[640px] mx-auto glass rounded-[26px] shadow-card px-1.5 py-1.5 grid grid-cols-4 gap-1">
        {TABS.map((t) => {
          const active = current === t.key;
          return (
            <button
              key={t.key}
              onClick={() => onChange(t.key)}
              className="relative h-14 rounded-2xl flex flex-col items-center justify-center gap-0.5"
              aria-label={t.label}
            >
              {active && (
                <motion.span
                  layoutId="tab-pill"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  className="absolute inset-0 rounded-2xl bg-gradient-to-b from-lime-200 to-lime-300 shadow-soft"
                />
              )}
              <span className={`relative text-xl leading-none ${active ? "" : "opacity-70"}`}>{t.icon}</span>
              <span className={`relative text-[10.5px] font-bold tracking-wide ${active ? "text-ink-900" : "text-ink-500"}`}>
                {t.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
