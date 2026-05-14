export type DayStatus = "pending" | "completed" | "failed";

export interface Challenge {
  id: number;
  startDate: string;
  lengthDays: number;
  title: string;
  createdAt: string;
}

export interface Activity {
  id: number;
  challengeId: number;
  name: string;
  icon: string;
  targetUnit: string;
  targetValue: number;
  color: string;
  sortOrder: number;
  weekdays: string; // CSV "0,1,2,3,4,5,6" where 0=Mon..6=Sun
}

export interface Day {
  id: number;
  challengeId: number;
  dayNumber: number;
  date: string;
  status: DayStatus;
  completionPct: number;
  streakAtDay: number;
  mood?: string | null;
  note?: string | null;
  noteEmojis?: string | null;
  updatedAt: string;
}

export interface ActivityLog {
  id: number;
  dayId: number;
  activityId: number;
  completed: boolean;
  valueDone: number;
  loggedAt: string;
}

export interface Media {
  id: number;
  dayId: number;
  mimeType: string;
  dataBase64: string;
  caption?: string | null;
  createdAt: string;
}

export interface DayDetail {
  day: Day;
  logs: ActivityLog[];
  media: Media[];
}

export interface WeekStats {
  weekNumber: number;
  daysCompleted: number;
  daysFailed: number;
  daysPending: number;
  weeklyPct: number;
  streakAtWeekEnd: number;
  hardestActivity: string;
  motivationalMsg: string;
}

export interface RoadmapItem {
  dayNumber: number;
  date: string;
  status: DayStatus;
  completionPct: number;
  streak: number;
}
