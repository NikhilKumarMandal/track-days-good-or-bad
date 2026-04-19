"use client";

import { useMemo } from "react";
import { ChevronLeft, ChevronRight, Plus, LogOut, Flame } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { MOOD_CONFIG } from "@/lib/utils";
import type { MoodEntry } from "@/db/schema/mood-schema";

const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DAY_NAMES = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

interface Props {
    year: number;
    month: number;
    entries: MoodEntry[];
    stats: {
        totalEntries: number;
        moodCounts: Record<string, number>;
        averageScore: number | null;
        streakDays: number;
    } | null;
    loading: boolean;
    user: { name: string; email: string; image?: string | null };
    onPrevMonth: () => void;
    onNextMonth: () => void;
    onToday: () => void;
    onDayClick: (date: string) => void;
    onAddClick: () => void;
}

function getDaysInMonth(year: number, month: number) {
    return new Date(year, month, 0).getDate();
}
function getFirstDayOfMonth(year: number, month: number) {
    const day = new Date(year, month - 1, 1).getDay();
    return day === 0 ? 6 : day - 1;
}
function padNum(n: number) { return String(n).padStart(2, "0"); }

export function MoodCalendar({
    year, month, entries, stats, loading, user,
    onPrevMonth, onNextMonth, onToday, onDayClick, onAddClick,
}: Props) {
    const router = useRouter();

    const entryMap = useMemo(() => {
        const map: Record<string, MoodEntry> = {};
        if (!Array.isArray(entries)) return map;
        for (const e of entries) map[e.date] = e;
        return map;
    }, [entries]);

    const todayStr = new Date().toISOString().split("T")[0];
    const isCurrentMonth = year === new Date().getFullYear() && month === new Date().getMonth() + 1;
    const daysInMonth = getDaysInMonth(year, month);
    const firstDayOffset = getFirstDayOfMonth(year, month);
    const prevMonthDays = getDaysInMonth(year, month === 1 ? 12 : month - 1);
    const prevYear = month === 1 ? year - 1 : year;
    const prevMonth = month === 1 ? 12 : month - 1;
    const nextYear = month === 12 ? year + 1 : year;
    const nextMonth = month === 12 ? 1 : month + 1;
    const totalCells = Math.ceil((firstDayOffset + daysInMonth) / 7) * 7;

    const cells = Array.from({ length: totalCells }, (_, i) => {
        if (i < firstDayOffset) {
            const day = prevMonthDays - firstDayOffset + i + 1;
            return { day, dateStr: `${prevYear}-${padNum(prevMonth)}-${padNum(day)}`, currentMonth: false };
        }
        const di = i - firstDayOffset;
        if (di < daysInMonth) {
            const day = di + 1;
            return { day, dateStr: `${year}-${padNum(month)}-${padNum(day)}`, currentMonth: true };
        }
        const day = di - daysInMonth + 1;
        return { day, dateStr: `${nextYear}-${padNum(nextMonth)}-${padNum(day)}`, currentMonth: false };
    });

    const handleSignOut = async () => {
        await authClient.signOut();
        router.push("/login");
    };

    const dominantMood = stats?.moodCounts
        ? Object.entries(stats.moodCounts).sort((a, b) => b[1] - a[1])[0]?.[0]
        : null;

    const filledDays = Object.keys(entryMap).filter(d => d.startsWith(`${year}-${padNum(month)}`)).length;

    return (
        <div className="w-full max-w-[460px]" style={{ animation: "pageIn 0.4s cubic-bezier(0.16,1,0.3,1) both" }}>

            {/* User bar */}
            <div className="flex items-center justify-between mb-5 px-1">
                <div className="flex items-center gap-2.5">
                    {user.image ? (
                        <img src={user.image} alt={user.name}
                            className="w-8 h-8 rounded-full object-cover ring-1 ring-[#2a2a2a]" />
                    ) : (
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ring-1 ring-[#2a2a2a]"
                            style={{ background: "linear-gradient(135deg, #f97316, #ea580c)" }}>
                            {user.name.charAt(0).toUpperCase()}
                        </div>
                    )}
                    <div>
                        <p className="text-[13px] font-semibold text-[#ccc] leading-none">{user.name}</p>
                        <p className="text-[10px] text-[#444] mt-0.5 leading-none">{user.email}</p>
                    </div>
                </div>
                <button onClick={handleSignOut}
                    className="flex items-center gap-1.5 text-[11px] text-[#333] hover:text-[#777] transition-colors px-3 py-1.5 rounded-lg hover:bg-[#161616]">
                    <LogOut size={12} />
                    Sign out
                </button>
            </div>

            {/* Card */}
            <div className="relative bg-[#111111] rounded-3xl overflow-hidden"
                style={{ border: "1px solid #1c1c1c", boxShadow: "0 32px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.02)" }}>

                <div className="h-px w-full"
                    style={{ background: "linear-gradient(90deg, transparent, rgba(249,115,22,0.5), transparent)" }} />

                {/* Header */}
                <div className="flex items-center justify-between px-5 pt-5 pb-4">
                    <div className="flex items-center gap-3">
                        <h2 className="text-[15px] font-bold text-white" style={{ letterSpacing: "-0.02em" }}>
                            {MONTH_NAMES[month - 1]},&nbsp;<span className="text-[#444]">{year}</span>
                        </h2>
                        <button onClick={onToday}
                            className="text-[10px] font-semibold px-2.5 py-1 rounded-full transition-all uppercase tracking-wider"
                            style={{
                                background: isCurrentMonth ? "#1e1e1e" : "transparent",
                                border: `1px solid ${isCurrentMonth ? "#2a2a2a" : "#1e1e1e"}`,
                                color: isCurrentMonth ? "#888" : "#333",
                            }}>
                            Today
                        </button>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <button onClick={onPrevMonth}
                            className="w-7 h-7 flex items-center justify-center rounded-lg text-[#444] hover:text-white hover:bg-[#1e1e1e] transition-all">
                            <ChevronLeft size={14} strokeWidth={2.5} />
                        </button>
                        <button onClick={onNextMonth}
                            className="w-7 h-7 flex items-center justify-center rounded-lg text-[#444] hover:text-white hover:bg-[#1e1e1e] transition-all">
                            <ChevronRight size={14} strokeWidth={2.5} />
                        </button>
                        <button onClick={onAddClick}
                            className="w-8 h-8 flex items-center justify-center rounded-full text-white ml-1 transition-all hover:scale-105 active:scale-95"
                            style={{ background: "linear-gradient(135deg, #f97316, #ea580c)", boxShadow: "0 4px 16px rgba(249,115,22,0.35)" }}>
                            <Plus size={15} strokeWidth={2.5} />
                        </button>
                    </div>
                </div>

                {/* Day headers */}
                <div className="grid grid-cols-7 px-4 mb-1">
                    {DAY_NAMES.map((d) => (
                        <div key={d} className="text-center text-[9px] font-bold tracking-widest py-1" style={{ color: "#2e2e2e" }}>
                            {d}
                        </div>
                    ))}
                </div>

                {/* Grid */}
                <div className="grid grid-cols-7 gap-[3px] px-4 pb-4">
                    {cells.map(({ day, dateStr, currentMonth }) => {
                        const entry = entryMap[dateStr];
                        const isToday = dateStr === todayStr;
                        const isFuture = dateStr > todayStr;
                        const moodConf = entry?.mood ? MOOD_CONFIG[entry.mood] : null;

                        return (
                            <button
                                key={dateStr}
                                onClick={() => !isFuture && currentMonth && onDayClick(dateStr)}
                                disabled={isFuture || !currentMonth}
                                className="relative aspect-square flex flex-col items-center justify-center rounded-xl transition-all duration-150 group"
                                style={{
                                    opacity: !currentMonth ? 0 : isFuture ? 0.25 : 1,
                                    pointerEvents: !currentMonth ? "none" : "auto",
                                    cursor: isFuture ? "default" : "pointer",
                                    background: isToday ? "rgba(249,115,22,0.1)" : entry ? "#191919" : "#141414",
                                    border: isToday ? "1px solid rgba(249,115,22,0.3)" : entry ? "1px solid #222" : "1px solid transparent",
                                }}
                                onMouseEnter={(e) => {
                                    if (!isFuture && currentMonth && !isToday) {
                                        (e.currentTarget as HTMLElement).style.background = "#1c1c1c";
                                        (e.currentTarget as HTMLElement).style.borderColor = "#2a2a2a";
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!isFuture && currentMonth && !isToday) {
                                        (e.currentTarget as HTMLElement).style.background = entry ? "#191919" : "#141414";
                                        (e.currentTarget as HTMLElement).style.borderColor = entry ? "#222" : "transparent";
                                    }
                                }}
                            >
                                <span className="text-[11px] font-semibold leading-none"
                                    style={{ color: isToday ? "#f97316" : entry ? "#777" : isFuture ? "#2a2a2a" : "#3a3a3a" }}>
                                    {day}
                                </span>
                                {moodConf && (
                                    <span className="text-[13px] leading-none mt-0.5" style={{ color: moodConf.color }}>
                                        {moodConf.emoji}
                                    </span>
                                )}
                                {isToday && !entry && (
                                    <div className="w-1 h-1 rounded-full mt-0.5" style={{ background: "#f97316" }} />
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Stats strip */}
                <div className="border-t px-5 py-3.5 flex items-center justify-between" style={{ borderColor: "#181818" }}>
                    <div className="flex items-center gap-2.5">
                        {Object.entries(MOOD_CONFIG).map(([key, conf]) => (
                            <div key={key} className="flex items-center gap-1">
                                <span style={{ color: conf.color, fontSize: 11 }}>{conf.emoji}</span>
                                <span className="text-[9px] font-semibold uppercase tracking-wider" style={{ color: "#2e2e2e" }}>
                                    {conf.label}
                                </span>
                            </div>
                        ))}
                    </div>
                    <div className="flex items-center gap-2 text-[11px]" style={{ color: "#333" }}>
                        {stats && (
                            <>
                                <span style={{ color: "#555" }}>{filledDays}</span>
                                <span>/</span>
                                <span style={{ color: "#555" }}>{daysInMonth}</span>
                                {stats.streakDays > 1 && (
                                    <span className="flex items-center gap-1 ml-1" style={{ color: "#f97316" }}>
                                        <Flame size={11} />{stats.streakDays}
                                    </span>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="border-t px-5 py-3 flex items-center justify-between" style={{ borderColor: "#161616" }}>
                    <div className="flex items-center gap-1.5 ">
                        {Object.entries(MOOD_CONFIG).map(([key, conf]) => (
                            <div key={key} className="w-1.5 h-1.5 rounded-full" style={{ background: conf.color, opacity: 0.5 }} title={conf.label} />
                        ))}
                    </div>
                    <div className="text-[10px] font-mono uppercase tracking-widest"
                        style={{ color: dominantMood ? (MOOD_CONFIG[dominantMood as keyof typeof MOOD_CONFIG]?.color + "88") : "#222" }}>
                        {dominantMood ? `mostly ${MOOD_CONFIG[dominantMood as keyof typeof MOOD_CONFIG]?.label}` : "no entries yet"}
                    </div>
                </div>

                {/* Loading overlay */}
                {loading && (
                    <div className="absolute inset-0 bg-[#111]/70 backdrop-blur-sm flex items-center justify-center rounded-3xl">
                        <svg className="animate-spin h-4 w-4" style={{ color: "#f97316" }} viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                    </div>
                )}
            </div>
        </div>
    );
}