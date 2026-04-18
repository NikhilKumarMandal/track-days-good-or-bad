import { relations } from "drizzle-orm";
import {
    pgTable,
    text,
    timestamp,
    integer,
    date,
    pgEnum,
    index,
} from "drizzle-orm/pg-core";
import { user } from "./auth-schema";

export const moodEnum = pgEnum("mood_level", [
    "great",
    "good",
    "okay",
    "bad",
    "awful",
]);

export const moodEntry = pgTable(
    "mood_entry",
    {
        id: text("id").primaryKey(),
        userId: text("user_id")
            .notNull()
            .references(() => user.id, { onDelete: "cascade" }),
        date: date("date").notNull(),
        mood: moodEnum("mood").notNull(),
        note: text("note"),
        energy: integer("energy"),   // 1–5
        sleep: integer("sleep"),     // hours
        tags: text("tags").array(),
        createdAt: timestamp("created_at").defaultNow().notNull(),
        updatedAt: timestamp("updated_at")
            .defaultNow()
            .$onUpdate(() => new Date())
            .notNull(),
    },
    (table) => [
        index("mood_entry_userId_idx").on(table.userId),
        index("mood_entry_date_idx").on(table.date),
    ],
);

export const moodEntryRelations = relations(moodEntry, ({ one }) => ({
    user: one(user, {
        fields: [moodEntry.userId],
        references: [user.id],
    }),
}));

export type MoodEntry = typeof moodEntry.$inferSelect;
export type NewMoodEntry = typeof moodEntry.$inferInsert;
export type MoodLevel = "great" | "good" | "okay" | "bad" | "awful";