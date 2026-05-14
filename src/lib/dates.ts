import type { Day } from "./types";

export const WEEK_LABELS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
export const MONTH_LABELS = [
  "Ene", "Feb", "Mar", "Abr", "May", "Jun",
  "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"
];

export function weekIndexOf(dayNumber: number): number {
  return Math.floor((dayNumber - 1) / 7);
}

export function totalWeeks(lengthDays: number): number {
  return Math.ceil(lengthDays / 7);
}

export function groupByWeek(days: Day[]): Day[][] {
  const out: Day[][] = [];
  for (const d of days) {
    const i = weekIndexOf(d.dayNumber);
    if (!out[i]) out[i] = [];
    out[i].push(d);
  }
  return out;
}

function parseDate(dateStr: string): Date {
  // Accepts "YYYY-MM-DD" or RFC3339 ("YYYY-MM-DDTHH:mm:ssZ").
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return new Date(dateStr + "T00:00:00");
  return new Date(dateStr);
}

export function isToday(dateStr: string): boolean {
  const d = parseDate(dateStr);
  const t = new Date();
  return (
    d.getFullYear() === t.getFullYear() &&
    d.getMonth() === t.getMonth() &&
    d.getDate() === t.getDate()
  );
}

export function isFuture(dateStr: string): boolean {
  const d = parseDate(dateStr);
  d.setHours(0, 0, 0, 0);
  const t = new Date();
  t.setHours(0, 0, 0, 0);
  return d.getTime() > t.getTime();
}

export function fmtDate(dateStr: string): string {
  const d = parseDate(dateStr);
  return `${d.getDate()} ${MONTH_LABELS[d.getMonth()]}`;
}

export function dayOfWeekLabel(dateStr: string): string {
  const d = parseDate(dateStr);
  const idx = (d.getDay() + 6) % 7;
  return WEEK_LABELS[idx];
}

/** Weekday index 0=Mon..6=Sun for a given YYYY-MM-DD. */
export function weekdayIndex(dateStr: string): number {
  const d = parseDate(dateStr);
  return (d.getDay() + 6) % 7;
}

/** Whether an activity (with weekdays CSV) applies on the given date. */
export function activityAppliesOn(weekdays: string, dateStr: string): boolean {
  const w = weekdayIndex(dateStr);
  return weekdays.split(",").map((s) => s.trim()).includes(String(w));
}

export function pct(n: number) {
  return Math.round(n);
}
