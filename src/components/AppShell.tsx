"use client";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import useSWR, { mutate } from "swr";
import { api } from "@/lib/api";
import { startSyncLoop } from "@/lib/sync";
import { isToday } from "@/lib/dates";
import BottomTabs, { TabKey } from "./BottomTabs";
import TodayView from "./views/TodayView";
import WeeksView from "./views/WeeksView";
import RoadmapView from "./views/RoadmapView";
import StatsView from "./views/StatsView";
import DayDetailModal from "./DayDetailModal";

export default function AppShell() {
  const [tab, setTab] = useState<TabKey>("today");
  const [openDayId, setOpenDayId] = useState<number | null>(null);

  const { data: challenge } = useSWR("challenge", () => api.challenge());
  const { data: days }      = useSWR("days",      () => api.days(),      { refreshInterval: 30_000 });
  const { data: weekStats } = useSWR("weekStats", () => api.weekStats(), { refreshInterval: 60_000 });
  const { data: activities } = useSWR("activities", () => api.activities());

  useEffect(() => { startSyncLoop(); }, []);

  // Always start on Today
  useEffect(() => { setTab("today"); }, []);

  const todayDay = (days || []).find((d) => isToday(d.date));

  const refreshAll = () => {
    mutate("days");
    mutate("weekStats");
  };

  return (
    <div className="min-h-screen with-tabs">
      <main className="max-w-[720px] mx-auto px-4 sm:px-6 pt-5 pb-2">
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.22 }}
          >
            {tab === "today" && (
              <TodayView
                challenge={challenge}
                day={todayDay}
                activities={activities || []}
                allDays={days || []}
                onOpenDay={(id) => setOpenDayId(id)}
                onGoTab={setTab}
              />
            )}
            {tab === "weeks" && (
              <WeeksView
                days={days || []}
                weekStats={weekStats || []}
                onOpenDay={(id) => setOpenDayId(id)}
              />
            )}
            {tab === "roadmap" && (
              <RoadmapView
                days={days || []}
                onOpenDay={(id) => setOpenDayId(id)}
              />
            )}
            {tab === "stats" && (
              <StatsView
                days={days || []}
                weekStats={weekStats || []}
                challenge={challenge}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      <BottomTabs current={tab} onChange={setTab} />

      <AnimatePresence>
        {openDayId != null && (
          <DayDetailModal
            dayId={openDayId}
            activities={activities || []}
            onClose={() => { setOpenDayId(null); refreshAll(); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
