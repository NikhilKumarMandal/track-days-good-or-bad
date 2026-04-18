import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { moodEntry } from "@/db/schema/mood-schema";
import { eq, and } from "drizzle-orm";
import { headers } from "next/headers";

async function getCurrentUser() {
    const session = await auth.api.getSession({ headers: await headers() });
    return session?.user ?? null;
}

// DELETE /api/moods/[id]
export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await db
        .delete(moodEntry)
        .where(and(eq(moodEntry.id, params.id), eq(moodEntry.userId, user.id)));

    return NextResponse.json({ success: true });
}