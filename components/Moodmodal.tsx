"use client";

import { useState, useEffect, useRef } from "react";
import { X, Trash2, Check } from "lucide-react";
import { MOOD_CONFIG, MOOD_LEVELS, DEFAULT_TAGS, parseLocalDate } from "@/lib/utils";
import type { MoodEntry, MoodLevel } from "@/db/schema/mood-schema";

interface Props {
    date: string;
    existingEntry?: MoodEntry;
    onClose: () => void;
    onSaved: () => void;
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function formatDisplayDate(dateStr: string) {
    const d = parseLocalDate(dateStr);
    return { day: DAYS[d.getDay()], full: `${MONTHS[d.getMonth()]} ${d.getDate()}` };
}

export function MoodModal({ date, existingEntry, onClose, onSaved }: Props) {
    const overlayRef = useRef<HTMLDivElement>(null);
    const [mood, setMood] = useState<MoodLevel | null>(existingEntry?.mood ?? null);
    const [note, setNote] = useState(existingEntry?.note ?? "");
    const [energy, setEnergy] = useState(existingEntry?.energy ?? 3);
    const [sleep, setSleep] = useState(existingEntry?.sleep ?? 7);
    const [tags, setTags] = useState<string[]>(existingEntry?.tags ?? []);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, [onClose]);

    const toggleTag = (tag: string) =>
        setTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);

    const handleSave = async () => {
        if (!mood) { setError("Pick a mood first"); return; }
        setSaving(true); setError("");
        try {
            const res = await fetch("/api/moods", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ date, mood, note, energy, sleep, tags }),
            });
            if (!res.ok) throw new Error();
            onSaved();
        } catch {
            setError("Failed to save. Try again.");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!existingEntry) return;
        setDeleting(true);
        try {
            await fetch(`/api/moods/${existingEntry.id}`, { method: "DELETE" });
            onSaved();
        } catch {
            setError("Failed to delete.");
        } finally {
            setDeleting(false);
        }
    };

    const isFuture = date > new Date().toISOString().split("T")[0];
    const { day, full } = formatDisplayDate(date);
    const selectedMoodConf = mood ? MOOD_CONFIG[mood] : null;

    return (
        <div
            ref={overlayRef}
            onClick={(e) => e.target === overlayRef.current && onClose()}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)", animation: "overlayIn 0.2s ease both" }}
        >
            <div className="w-full max-w-[400px] relative" style={{ animation: "modalIn 0.25s cubic-bezier(0.16,1,0.3,1) both" }}>

                {/* Mood glow behind card */}
                {selectedMoodConf && (
                    <div
                        className="absolute -inset-px rounded-3xl pointer-events-none transition-all duration-500"
                        style={{
                            background: `radial-gradient(ellipse at 50% 0%, ${selectedMoodConf.hex}25, transparent 60%)`,
                            filter: "blur(2px)",
                        }}
                    />
                )}

                <div className="relative bg-[#111] rounded-3xl overflow-hidden"
                    style={{ border: "1px solid #1e1e1e", boxShadow: "0 32px 64px rgba(0,0,0,0.7)" }}>

                    {/* Top accent — changes color with selected mood */}
                    <div
                        className="h-px w-full transition-all duration-500"
                        style={{
                            background: selectedMoodConf
                                ? `linear-gradient(90deg, transparent, ${selectedMoodConf.hex}, transparent)`
                                : "linear-gradient(90deg, transparent, #2a2a2a, transparent)",
                        }}
                    />

                    {/* Header */}
                    <div className="flex items-start justify-between px-5 pt-5 pb-4" style={{ borderBottom: "1px solid #181818" }}>
                        <div>
                            <p className="text-[9px] font-bold uppercase tracking-[0.15em]" style={{ color: "#444" }}>
                                {existingEntry ? "Edit entry" : "New entry"}
                            </p>
                            <div className="flex items-baseline gap-2 mt-1">
                                <span className="text-[14px] font-bold text-white">{full}</span>
                                <span className="text-[12px]" style={{ color: "#555" }}>{day}</span>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-7 h-7 flex items-center justify-center rounded-xl transition-all"
                            style={{ color: "#444", background: "#1a1a1a", border: "1px solid #252525" }}
                            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#fff"; (e.currentTarget as HTMLElement).style.borderColor = "#333"; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "#444"; (e.currentTarget as HTMLElement).style.borderColor = "#252525"; }}
                        >
                            <X size={13} strokeWidth={2.5} />
                        </button>
                    </div>

                    <div className="px-5 py-4 space-y-5">

                        {/* ── Mood picker ── */}
                        <div>
                            <p className="text-[9px] font-bold uppercase tracking-[0.15em] mb-3" style={{ color: "#444" }}>
                                How are you feeling?
                            </p>
                            <div className="grid grid-cols-5 gap-2">
                                {MOOD_LEVELS.map((m) => {
                                    const conf = MOOD_CONFIG[m];
                                    const selected = mood === m;
                                    return (
                                        <button
                                            key={m}
                                            onClick={() => setMood(m)}
                                            className="flex flex-col items-center gap-2 py-3 rounded-2xl transition-all duration-200"
                                            style={{
                                                background: selected ? `${conf.hex}18` : "#181818",
                                                border: `1px solid ${selected ? conf.hex + "60" : "#252525"}`,
                                                transform: selected ? "scale(1.06)" : "scale(1)",
                                                boxShadow: selected ? `0 0 20px ${conf.hex}30` : "none",
                                            }}
                                        >
                                            <span style={{ fontSize: 22, color: selected ? conf.hex : "#444", lineHeight: 1 }}>
                                                {conf.emoji}
                                            </span>
                                            <span
                                                className="text-[8px] font-bold uppercase tracking-wider leading-none"
                                                style={{ color: selected ? conf.hex : "#444" }}
                                            >
                                                {conf.label}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* ── Energy ── */}
                        <div>
                            <div className="flex items-center justify-between mb-2.5">
                                <p className="text-[9px] font-bold uppercase tracking-[0.15em]" style={{ color: "#444" }}>Energy</p>
                                <span className="text-[11px] font-mono" style={{ color: "#555" }}>{energy} / 5</span>
                            </div>
                            <div className="flex gap-2">
                                {[1, 2, 3, 4, 5].map(n => (
                                    <button
                                        key={n}
                                        onClick={() => setEnergy(n)}
                                        className="flex-1 h-2 rounded-full transition-all duration-200"
                                        style={{ background: n <= energy ? "#f97316" : "#222" }}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* ── Sleep ── */}
                        <div>
                            <div className="flex items-center justify-between mb-2.5">
                                <p className="text-[9px] font-bold uppercase tracking-[0.15em]" style={{ color: "#444" }}>Sleep</p>
                                <span className="text-[11px] font-mono" style={{ color: "#555" }}>{sleep}h</span>
                            </div>
                            <input
                                type="range" min={0} max={12} step={0.5} value={sleep}
                                onChange={e => setSleep(parseFloat(e.target.value))}
                                className="w-full h-2 rounded-full appearance-none cursor-pointer"
                                style={{
                                    background: `linear-gradient(to right, #f97316 ${(sleep / 12) * 100}%, #222 ${(sleep / 12) * 100}%)`,
                                    accentColor: "#f97316",
                                }}
                            />
                            <div className="flex justify-between mt-1.5">
                                <span className="text-[9px]" style={{ color: "#333" }}>0h</span>
                                <span className="text-[9px]" style={{ color: "#333" }}>12h</span>
                            </div>
                        </div>

                        {/* ── Tags ── */}
                        <div>
                            <p className="text-[9px] font-bold uppercase tracking-[0.15em] mb-2.5" style={{ color: "#444" }}>Tags</p>
                            <div className="flex flex-wrap gap-1.5">
                                {DEFAULT_TAGS.map(tag => {
                                    const active = tags.includes(tag);
                                    return (
                                        <button
                                            key={tag}
                                            onClick={() => toggleTag(tag)}
                                            className="px-3 py-1 rounded-full text-[10px] font-semibold transition-all duration-150"
                                            style={{
                                                background: active ? "rgba(249,115,22,0.15)" : "#181818",
                                                border: `1px solid ${active ? "rgba(249,115,22,0.4)" : "#252525"}`,
                                                color: active ? "#f97316" : "#555",
                                            }}
                                        >
                                            {tag}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* ── Note ── */}
                        <div>
                            <p className="text-[9px] font-bold uppercase tracking-[0.15em] mb-2.5" style={{ color: "#444" }}>Note</p>
                            <textarea
                                value={note}
                                onChange={e => setNote(e.target.value)}
                                placeholder="What's on your mind today?"
                                rows={2}
                                className="w-full rounded-2xl px-4 py-3 text-[13px] resize-none focus:outline-none"
                                style={{
                                    background: "#0d0d0d",
                                    border: "1px solid #222",
                                    color: "#ccc",
                                    caretColor: "#f97316",
                                  
                                }}
                                onFocus={e => { (e.target as HTMLElement).style.borderColor = "#333"; }}
                                onBlur={e => { (e.target as HTMLElement).style.borderColor = "#222"; }}
                            />
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 rounded-xl px-3.5 py-2.5"
                                style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
                                <span style={{ color: "#ef4444" }}>✕</span>
                                <p className="text-[11px]" style={{ color: "#ef4444" }}>{error}</p>
                            </div>
                        )}

                        {isFuture && (
                            <p className="text-center text-[11px]" style={{ color: "#444" }}>
                                Can&apos;t log mood for future dates
                            </p>
                        )}
                    </div>

                    {/* ── Actions ── */}
                    <div className="flex gap-2 px-5 pb-5">
                        {existingEntry && (
                            <button
                                onClick={handleDelete}
                                disabled={deleting}
                                className="w-10 h-10 flex items-center justify-center rounded-2xl transition-all disabled:opacity-40"
                                style={{ background: "#181818", border: "1px solid #252525", color: "#444" }}
                                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#ef4444"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(239,68,68,0.4)"; }}
                                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "#444"; (e.currentTarget as HTMLElement).style.borderColor = "#252525"; }}
                            >
                                {deleting
                                    ? <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                                    : <Trash2 size={14} />
                                }
                            </button>
                        )}
                        <button
                            onClick={handleSave}
                            disabled={saving || !mood || isFuture}
                            className="flex-1 h-10 flex items-center justify-center gap-2 rounded-2xl text-[13px] font-semibold transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                            style={{
                                background: mood ? "linear-gradient(135deg, #f97316, #ea580c)" : "#181818",
                                boxShadow: mood ? "0 4px 20px rgba(249,115,22,0.35)" : "none",
                                color: mood ? "#fff" : "#444",
                                border: mood ? "none" : "1px solid #252525",
                            }}
                        >
                            {saving
                                ? <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                                : <Check size={15} strokeWidth={2.5} />
                            }
                            {saving ? "Saving..." : existingEntry ? "Update" : "Save entry"}
                        </button>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes overlayIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes modalIn {
                    from { opacity: 0; transform: translateY(20px) scale(0.97); }
                    to   { opacity: 1; transform: translateY(0)     scale(1);    }
                }
            `}</style>
        </div>
    );
}