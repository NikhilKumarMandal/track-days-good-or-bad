import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { MoodCalendarWrapper } from "@/components/Moodcalendarwrapper";

export default async function CalendarPage() {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) redirect("/login");

    return (
        <main className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
            <MoodCalendarWrapper user={session.user} />
        </main>
    );
}