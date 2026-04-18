import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { moodEntry } from "@/db/schema/mood-schema";
import { eq, and, gte, lte } from "drizzle-orm";
import { headers } from "next/headers";

async function getCurrentUser() {
    const session = await auth.api.getSession({ headers: await headers() });
    return session?.user ?? null;
}

// GET /api/moods/stats?year=2026&month=1
export async function GET(req: NextRequest) {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const year = parseInt(searchParams.get("year") || String(new Date().getFullYear()));
    const month = parseInt(searchParams.get("month") || String(new Date().getMonth() + 1));

    const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
    const endMonth = month === 12 ? 1 : month + 1;
    const endYear = month === 12 ? year + 1 : year;
    const endDate = `${endYear}-${String(endMonth).padStart(2, "0")}-01`;

    const entries = await db
        .select()
        .from(moodEntry)
        .where(
            and(
                eq(moodEntry.userId, user.id),
                gte(moodEntry.date, startDate),
                lte(moodEntry.date, endDate)
            )
        );

    const moodCounts = entries.reduce(
        (acc, e) => {
            acc[e.mood] = (acc[e.mood] || 0) + 1;
            return acc;
        },
        {} as Record<string, number>
    );

    const moodScores: Record<string, number> = {
        great: 5,
        good: 4,
        okay: 3,
        bad: 2,
        awful: 1,
    };

    const totalScore = entries.reduce(
        (sum, e) => sum + (moodScores[e.mood] || 3),
        0
    );
    const averageScore =
        entries.length > 0 ? totalScore / entries.length : null;

    const streakDays = calculateStreak(entries.map((e) => e.date));

    return NextResponse.json({
        totalEntries: entries.length,
        moodCounts,
        averageScore,
        streakDays,
    });
}

function calculateStreak(dates: string[]): number {
    if (dates.length === 0) return 0;
    const sorted = [...dates].sort().reverse();
    const today = new Date().toISOString().split("T")[0];
    let streak = 0;
    let current = today;

    for (const date of sorted) {
        if (date === current) {
            streak++;
            const d = new Date(current);
            d.setDate(d.getDate() - 1);
            current = d.toISOString().split("T")[0];
        } else {
            break;
        }
    }
    return streak;
}