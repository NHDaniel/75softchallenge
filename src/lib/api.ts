import type {
  Activity, Challenge, Day, DayDetail, Media, RoadmapItem, WeekStats
} from "./types";

export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080";

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
    cache: "no-store"
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const api = {
  challenge: () => req<Challenge>("/api/challenge"),
  activities: () => req<Activity[]>("/api/activities"),
  days: () => req<Day[]>("/api/days"),
  day: (id: number) => req<DayDetail>(`/api/days/${id}`),
  patchDay: (id: number, body: Partial<Pick<Day, "status" | "mood" | "note" | "noteEmojis">>) =>
    req<void>(`/api/days/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
  upsertLog: (dayId: number, body: { activityId: number; completed: boolean; valueDone: number }) =>
    req<void>(`/api/days/${dayId}/logs`, { method: "POST", body: JSON.stringify(body) }),
  listMedia: (dayId: number) => req<Media[]>(`/api/days/${dayId}/media`),
  addMedia: (dayId: number, body: { mimeType: string; dataBase64: string; caption?: string }) =>
    req<{ id: number }>(`/api/days/${dayId}/media`, { method: "POST", body: JSON.stringify(body) }),
  deleteMedia: (id: number) => req<void>(`/api/media/${id}`, { method: "DELETE" }),
  weekStats: () => req<WeekStats[]>("/api/stats/weeks"),
  roadmap: () => req<RoadmapItem[]>("/api/stats/roadmap")
};
