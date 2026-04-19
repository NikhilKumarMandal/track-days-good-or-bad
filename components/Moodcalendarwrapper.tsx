"use client";

import { useState, useEffect, useCallback } from "react";
import { MoodCalendar } from "@/components/Moodcalendar";
import { MoodModal } from "@/components/Moodmodal";
import type { MoodEntry } from "@/db/schema/mood-schema";

interface Props {
    user: { id: string; name: string; email: string };
}

export function MoodCalendarWrapper({ user }: Props) {
    const today = new Date();
    const [year, setYear] = useState(today.getFullYear());
    const [month, setMonth] = useState(today.getMonth() + 1);
    const [entries, setEntries] = useState<MoodEntry[]>([]);
    const [stats, setStats] = useState<{
        totalEntries: number;
        moodCounts: Record<string, number>;
        averageScore: number | null;
        streakDays: number;
    } | null>(null);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [moodsRes, statsRes] = await Promise.all([
                fetch(`/api/moods?year=${year}&month=${month}`),
                fetch(`/api/moods/stats?year=${year}&month=${month}`),
            ]);
            const [moodsData, statsData] = await Promise.all([
                moodsRes.json(),
                statsRes.json(),
            ]);
            setEntries(Array.isArray(moodsData) ? moodsData : []);
            setStats(statsData && typeof statsData === "object" && !statsData.error ? statsData : null);
        } catch (e) {
            console.error("Failed to fetch mood data", e);
            setEntries([]);
            setStats(null);
        } finally {
            setLoading(false);
        }
    }, [year, month]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const goToPrevMonth = () => {
        if (month === 1) { setMonth(12); setYear(y => y - 1); }
        else setMonth(m => m - 1);
    };
    const goToNextMonth = () => {
        if (month === 12) { setMonth(1); setYear(y => y + 1); }
        else setMonth(m => m + 1);
    };
    const goToToday = () => {
        setYear(today.getFullYear());
        setMonth(today.getMonth() + 1);
    };

    const selectedEntry = entries.find((e) => e.date === selectedDate);

    return (
        <>
            <MoodCalendar
                year={year}
                month={month}
                entries={entries}
                stats={stats}
                loading={loading}
                user={user}
                onPrevMonth={goToPrevMonth}
                onNextMonth={goToNextMonth}
                onToday={goToToday}
                onDayClick={(dateStr) => setSelectedDate(dateStr)}
                onAddClick={() => setSelectedDate(new Date().toISOString().split("T")[0])}
            />
            {selectedDate && (
                <MoodModal
                    date={selectedDate}
                    existingEntry={selectedEntry}
                    onClose={() => setSelectedDate(null)}
                    onSaved={() => { setSelectedDate(null); fetchData(); }}
                />
            )}
        </>
    );
}