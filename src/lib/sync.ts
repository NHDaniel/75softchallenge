// IndexedDB cache + outbox for offline-first sync.
import { openDB, type IDBPDatabase } from "idb";
import { api } from "./api";

interface OutboxItem {
  id?: number;
  kind: "patchDay" | "upsertLog" | "addMedia" | "deleteMedia";
  payload: any;
  createdAt: number;
}

let dbp: Promise<IDBPDatabase> | null = null;
function db() {
  if (!dbp) {
    dbp = openDB("novio", 1, {
      upgrade(d) {
        if (!d.objectStoreNames.contains("kv")) d.createObjectStore("kv");
        if (!d.objectStoreNames.contains("outbox"))
          d.createObjectStore("outbox", { keyPath: "id", autoIncrement: true });
      }
    });
  }
  return dbp;
}

export async function cacheGet<T>(key: string): Promise<T | undefined> {
  return (await db()).get("kv", key) as Promise<T | undefined>;
}
export async function cacheSet<T>(key: string, val: T) {
  await (await db()).put("kv", val, key);
}

export async function enqueue(item: Omit<OutboxItem, "id" | "createdAt">) {
  const d = await db();
  await d.add("outbox", { ...item, createdAt: Date.now() });
}

export async function flushOutbox() {
  if (typeof navigator !== "undefined" && !navigator.onLine) return;
  const d = await db();
  const tx = d.transaction("outbox", "readwrite");
  const store = tx.objectStore("outbox");
  const all = (await store.getAll()) as OutboxItem[];
  for (const item of all) {
    try {
      switch (item.kind) {
        case "patchDay":
          await api.patchDay(item.payload.id, item.payload.body);
          break;
        case "upsertLog":
          await api.upsertLog(item.payload.dayId, item.payload.body);
          break;
        case "addMedia":
          await api.addMedia(item.payload.dayId, item.payload.body);
          break;
        case "deleteMedia":
          await api.deleteMedia(item.payload.id);
          break;
      }
      if (item.id != null) await store.delete(item.id);
    } catch {
      // keep in outbox
    }
  }
  await tx.done;
}

export function startSyncLoop() {
  if (typeof window === "undefined") return;
  const tick = () => flushOutbox().catch(() => {});
  window.addEventListener("online", tick);
  setInterval(tick, 15_000);
  tick();
}
