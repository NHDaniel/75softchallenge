"use client";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import useSWR, { mutate } from "swr";
import { api } from "@/lib/api";
import type { Activity, DayStatus } from "@/lib/types";
import { fmtDate, dayOfWeekLabel, activityAppliesOn } from "@/lib/dates";

const MOODS = ["🥰", "😌", "🔥", "🥲", "😴", "🤯", "🌿", "✨", "💪"];

export default function DayDetailModal({
  dayId, activities, onClose
}: {
  dayId: number;
  activities: Activity[];
  onClose: () => void;
}) {
  const { data, isLoading } = useSWR(["day", dayId], () => api.day(dayId));
  const [note, setNote] = useState("");
  const [emojis, setEmojis] = useState("");
  const [mood, setMood] = useState<string>("");
  const [status, setStatus] = useState<DayStatus>("pending");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!data) return;
    setNote(data.day.note ?? "");
    setEmojis(data.day.noteEmojis ?? "");
    setMood(data.day.mood ?? "");
    setStatus(data.day.status);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.day?.id]);

  if (isLoading || !data) return <Sheet onClose={onClose}><div className="p-6 text-ink-500">cargando…</div></Sheet>;
  const { day, logs, media } = data;

  const dayActivities = activities.filter((a) => activityAppliesOn(a.weekdays, day.date));
  const logsByActivity = new Map(logs.map((l) => [l.activityId, l]));

  const toggleLog = async (a: Activity) => {
    const existing = logsByActivity.get(a.id);
    const next = !(existing?.completed ?? false);
    await api.upsertLog(day.id, {
      activityId: a.id, completed: next, valueDone: next ? a.targetValue : 0
    });
    mutate(["day", dayId]);
    mutate("days");
    mutate("weekStats");
  };

  const save = async () => {
    setSaving(true);
    try {
      await api.patchDay(day.id, { status, note, noteEmojis: emojis, mood });
      mutate(["day", dayId]);
      mutate("days"); mutate("weekStats");
    } finally { setSaving(false); }
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const result = String(reader.result || "");
      const base64 = result.split(",")[1] || "";
      await api.addMedia(day.id, { mimeType: file.type, dataBase64: base64 });
      mutate(["day", dayId]);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const removeMedia = async (id: number) => {
    await api.deleteMedia(id);
    mutate(["day", dayId]);
  };

  return (
    <Sheet onClose={onClose}>
      <div className="px-5 pt-5 pb-3 flex items-start gap-3 border-b border-ink-200/60">
        <div className="text-3xl animate-floaty">🌿</div>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] uppercase tracking-widest text-ink-500 font-bold">{dayOfWeekLabel(day.date)}</div>
          <h3 className="font-display text-xl font-extrabold text-ink-900 leading-tight">
            Día {day.dayNumber} <span className="text-ink-400 text-sm font-normal">· {fmtDate(day.date)}</span>
          </h3>
          <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px]">
            <Pill>📈 {Math.round(day.completionPct)}%</Pill>
            <Pill>🔥 {day.streakAtDay}</Pill>
          </div>
        </div>
        <button onClick={onClose} className="text-ink-500 hover:text-ink-900 text-xl leading-none px-2">✕</button>
      </div>

      <Section title="Estado">
        <div className="flex gap-1.5">
          <StatusBtn current={status} v="completed" label="✅ Completado" onChange={setStatus} />
          <StatusBtn current={status} v="failed"    label="💔 Fallido"    onChange={setStatus} />
          <StatusBtn current={status} v="pending"   label="⏳ Pendiente"  onChange={setStatus} />
        </div>
      </Section>

      <Section title="Checklist histórico">
        <ul className="space-y-1.5">
          {dayActivities.map((a) => {
            const l = logsByActivity.get(a.id);
            const done = !!l?.completed;
            return (
              <li key={a.id}>
                <button
                  onClick={() => toggleLog(a)}
                  className={`w-full text-left rounded-2xl px-3 py-2.5 border flex items-center gap-3 transition ${
                    done ? "bg-lime-50 border-lime-300" : "bg-white border-ink-200 hover:border-lime-300"
                  }`}
                >
                  <span className={`grid place-items-center w-9 h-9 rounded-xl text-lg ${done ? "bg-lime-300" : "bg-canvas-100"}`}>
                    {a.icon}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm text-ink-900 truncate">{done ? "✅" : "⬜"} {a.name}</div>
                    <div className="text-[10px] text-ink-500 font-mono">
                      {a.targetValue} {a.targetUnit}
                      {l && <> · {new Date(l.loggedAt).toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" })}</>}
                    </div>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </Section>

      <Section title="Nota diaria">
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="¿Cómo te sentiste hoy? reflexiones, pensamientos…"
          className="min-h-[110px] w-full rounded-2xl bg-canvas-50 border border-ink-200 focus:border-lime-400 focus:ring-4 focus:ring-lime-200/50 outline-none p-3 text-sm text-ink-900 placeholder:text-ink-400"
        />
        <div className="mt-3 grid grid-cols-2 gap-2">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-ink-500 font-bold mb-1">Emojis</div>
            <input
              value={emojis}
              onChange={(e) => setEmojis(e.target.value)}
              placeholder="🌿✨"
              className="w-full rounded-2xl bg-canvas-50 border border-ink-200 focus:border-lime-400 outline-none px-3 py-2 text-base"
            />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-widest text-ink-500 font-bold mb-1">Mood</div>
            <div className="flex flex-wrap gap-1">
              {MOODS.map((m) => (
                <button
                  key={m}
                  onClick={() => setMood(m)}
                  className={`text-lg rounded-xl px-2 py-1 border ${
                    mood === m ? "bg-lime-100 border-lime-400" : "bg-white border-ink-200"
                  }`}
                >{m}</button>
              ))}
            </div>
          </div>
        </div>
      </Section>

      <Section title="Multimedia">
        <div className="grid grid-cols-3 gap-2">
          {media.map((m) => (
            <div key={m.id} className="relative group rounded-xl overflow-hidden border border-ink-200">
              {m.mimeType.startsWith("image/") ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={`data:${m.mimeType};base64,${m.dataBase64}`} alt="" className="w-full h-24 object-cover" />
              ) : (
                <div className="w-full h-24 grid place-items-center text-xs text-ink-500">{m.mimeType}</div>
              )}
              <button
                onClick={() => removeMedia(m.id)}
                className="absolute top-1 right-1 text-[10px] bg-white/90 px-1.5 py-0.5 rounded shadow-soft opacity-0 group-hover:opacity-100"
              >✕</button>
            </div>
          ))}
          <label className="cursor-pointer rounded-xl border-2 border-dashed border-ink-200 hover:border-lime-400 hover:bg-lime-50 transition w-full h-24 grid place-items-center text-xs text-ink-500">
            + foto
            <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
          </label>
        </div>
      </Section>

      <div className="px-5 py-4 border-t border-ink-200/60 sticky bottom-0 bg-white/95 backdrop-blur flex items-center gap-3">
        <button onClick={onClose} className="text-ink-600 font-bold text-sm px-3 py-2">Cerrar</button>
        <button
          onClick={save}
          disabled={saving}
          className="ml-auto rounded-2xl bg-lime-400 hover:bg-lime-300 text-ink-900 font-extrabold px-5 py-2.5 shadow-glow active:scale-95 disabled:opacity-60 transition"
        >
          {saving ? "Guardando…" : "Guardar día"}
        </button>
      </div>
    </Sheet>
  );
}

function Sheet({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-ink-900/30 backdrop-blur-sm"
    >
      <motion.div
        initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 30, opacity: 0 }}
        transition={{ type: "spring", stiffness: 280, damping: 28 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full sm:w-[min(92vw,560px)] sm:rounded-3xl rounded-t-3xl shadow-card max-h-[92vh] overflow-y-auto fancy-scroll"
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="px-5 py-4 border-b border-ink-200/60 last:border-0">
      <div className="text-[10px] uppercase tracking-widest text-ink-500 font-bold mb-2">{title}</div>
      {children}
    </div>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full bg-canvas-100 border border-ink-200 px-2.5 py-0.5">{children}</span>;
}

function StatusBtn({
  current, v, label, onChange
}: { current: DayStatus; v: DayStatus; label: string; onChange: (s: DayStatus) => void }) {
  const active = current === v;
  const palette: Record<DayStatus, string> = {
    completed: active ? "bg-lime-300 border-lime-500 text-ink-900"     : "bg-white border-ink-200 text-ink-700",
    failed:    active ? "bg-rose-200 border-rose-400 text-rose-800"     : "bg-white border-ink-200 text-ink-700",
    pending:   active ? "bg-canvas-200 border-ink-300 text-ink-800"     : "bg-white border-ink-200 text-ink-700"
  };
  return (
    <button
      onClick={() => onChange(v)}
      className={`flex-1 text-xs font-bold rounded-xl px-2.5 py-2 border transition ${palette[v]}`}
    >
      {label}
    </button>
  );
}
