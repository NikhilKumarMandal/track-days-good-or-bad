import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { MoodLevel } from "@/db/schema/mood-schema";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const MOOD_CONFIG: Record<
  MoodLevel,
  { label: string; emoji: string; color: string; bg: string; ring: string }
> = {
  great: {
    label: "Great",
    emoji: "✦",
    color: "text-emerald-400",
    bg: "bg-emerald-400",
    ring: "ring-emerald-400",
  },
  good: {
    label: "Good",
    emoji: "◎",
    color: "text-green-300",
    bg: "bg-green-300",
    ring: "ring-green-300",
  },
  okay: {
    label: "Okay",
    emoji: "◐",
    color: "text-yellow-400",
    bg: "bg-yellow-400",
    ring: "ring-yellow-400",
  },
  bad: {
    label: "Bad",
    emoji: "◑",
    color: "text-orange-400",
    bg: "bg-orange-400",
    ring: "ring-orange-400",
  },
  awful: {
    label: "Awful",
    emoji: "✕",
    color: "text-red-400",
    bg: "bg-red-400",
    ring: "ring-red-400",
  },
};

export const MOOD_LEVELS: MoodLevel[] = ["great", "good", "okay", "bad", "awful"];

export const DEFAULT_TAGS = [
  "work",
  "family",
  "exercise",
  "social",
  "health",
  "travel",
  "creative",
  "rest",
  "stress",
  "gratitude",
];

export function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

export function parseLocalDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day);
}