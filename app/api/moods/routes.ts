import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { moodEntry } from "@/db/schema/mood-schema";
import { eq, and, gte, lte } from "drizzle-orm";
import { headers } from "next/headers";
import { nanoid } from "nanoid";


async function getCurrentUser() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    return session?.user ?? null;
}

// GET /api/moods?year=2026&month=1
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

    return NextResponse.json(entries);
}

// POST /api/moods
export async function POST(req: NextRequest) {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { date, mood, note, energy, sleep, tags } = body;

    if (!date || !mood) {
        return NextResponse.json({ error: "date and mood are required" }, { status: 400 });
    }

    // Upsert: delete existing entry for that date then insert
    await db
        .delete(moodEntry)
        .where(and(eq(moodEntry.userId, user.id), eq(moodEntry.date, date)));

    const [entry] = await db
        .insert(moodEntry)
        .values({
            id: nanoid(),
            userId: user.id,
            date,
            mood,
            note: note || null,
            energy: energy || null,
            sleep: sleep || null,
            tags: tags || [],
        })
        .returning();

    return NextResponse.json(entry, { status: 201 });
}