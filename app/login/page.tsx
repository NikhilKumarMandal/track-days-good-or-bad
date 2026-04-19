"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";

const MOOD_ORBS = [
    { emoji: "✦", color: "#22c55e", label: "Great", top: "12%", left: "8%", size: 44, delay: "0s" },
    { emoji: "◎", color: "#86efac", label: "Good", top: "68%", left: "5%", size: 36, delay: "0.6s" },
    { emoji: "◐", color: "#facc15", label: "Okay", top: "28%", right: "7%", size: 40, delay: "1.2s" },
    { emoji: "◑", color: "#f97316", label: "Bad", top: "72%", right: "9%", size: 34, delay: "0.3s" },
    { emoji: "✕", color: "#ef4444", label: "Awful", top: "45%", left: "3%", size: 30, delay: "0.9s" },
    { emoji: "✦", color: "#22c55e", label: "Great", top: "85%", left: "22%", size: 28, delay: "1.5s" },
    { emoji: "◎", color: "#86efac", label: "Good", top: "8%", right: "22%", size: 32, delay: "0.4s" },
    { emoji: "◐", color: "#facc15", label: "Okay", top: "88%", right: "25%", size: 38, delay: "1.1s" },
];

export default function LoginPage() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleGoogleSignIn = async () => {
        setLoading(true);
        setError("");
        try {
            await authClient.signIn.social({
                provider: "google",
                callbackURL: "/calendar",
            });
        } catch {
            setError("Failed to sign in with Google. Please try again.");
            setLoading(false);
        }
    };

    return (
        <div
            style={{
                position: "relative",
                minHeight: "100vh",
                background: "#080808",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
            }}
        >
            {/* Grid background */}
            <div style={{
                position: "absolute", inset: 0, opacity: 0.03,
                backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
                backgroundSize: "48px 48px",
            }} />

            {/* Center glow */}
            <div style={{
                position: "absolute", inset: 0, pointerEvents: "none",
                background: "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(249,115,22,0.06) 0%, transparent 70%)",
            }} />

            {/* Floating orbs */}
            {MOOD_ORBS.map((orb, i) => (
                <div key={i} style={{
                    position: "absolute",
                    top: orb.top, left: orb.left, right: orb.right,
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                    opacity: 0.3, pointerEvents: "none", userSelect: "none",
                    animation: `floatOrb 6s ease-in-out infinite`,
                    animationDelay: orb.delay,
                }}>
                    <span style={{ fontSize: orb.size, color: orb.color, lineHeight: 1 }}>{orb.emoji}</span>
                    <span style={{ fontSize: 9, color: orb.color, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em" }}>
                        {orb.label}
                    </span>
                </div>
            ))}

            {/* Card */}
            <div style={{
                position: "relative", width: "100%", maxWidth: 380,
                margin: "0 16px",
                animation: "cardIn 0.5s cubic-bezier(0.16,1,0.3,1) both",
            }}>
                <div style={{
                    background: "#111111",
                    border: "1px solid #1e1e1e",
                    borderRadius: 24,
                    overflow: "hidden",
                    boxShadow: "0 32px 64px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.02)",
                }}>
                    {/* Top accent */}
                    <div style={{ height: 1, background: "linear-gradient(90deg, transparent, rgba(249,115,22,0.6), transparent)" }} />

                    <div style={{ padding: "40px 32px 32px" }}>
                        {/* Logo */}
                        <div style={{ display: "flex", justifyContent: "center", marginBottom: 32 }}>
                            <div style={{ position: "relative" }}>
                                <div style={{
                                    width: 64, height: 64, borderRadius: 18,
                                    background: "linear-gradient(135deg, #1a1a1a, #222)",
                                    border: "1px solid #2a2a2a",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    boxShadow: "0 0 32px rgba(249,115,22,0.15), inset 0 1px 0 rgba(255,255,255,0.05)",
                                }}>
                                    <span style={{ fontSize: 30, color: "#f97316" }}>◎</span>
                                </div>
                                <div style={{
                                    position: "absolute", inset: 0, borderRadius: 18,
                                    border: "1px solid rgba(249,115,22,0.2)",
                                    animation: "pulseRing 2.5s ease-out infinite",
                                }} />
                            </div>
                        </div>

                        {/* Heading */}
                        <div style={{ textAlign: "center", marginBottom: 32 }}>
                            <h1 style={{ fontSize: 24, fontWeight: 700, color: "#fff", letterSpacing: "-0.03em", margin: "0 0 8px" }}>
                                Moodly
                            </h1>
                            <p style={{ fontSize: 13, color: "#555", lineHeight: 1.6, margin: 0 }}>
                                Your daily mood journal.<br />Simple, private, honest.
                            </p>
                        </div>

                        {/* Mood icons preview */}
                        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 32 }}>
                            {[
                                { e: "✦", c: "#22c55e" }, { e: "◎", c: "#86efac" },
                                { e: "◐", c: "#facc15" }, { e: "◑", c: "#f97316" },
                                { e: "✕", c: "#ef4444" },
                            ].map((m, i) => (
                                <div key={i} style={{
                                    width: 36, height: 36, borderRadius: 12,
                                    background: "#1a1a1a", border: "1px solid #222",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    animation: `moodPop 0.4s cubic-bezier(0.34,1.56,0.64,1) both`,
                                    animationDelay: `${0.1 + i * 0.07}s`,
                                }}>
                                    <span style={{ color: m.c, fontSize: 16 }}>{m.e}</span>
                                </div>
                            ))}
                        </div>

                        {/* Divider */}
                        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
                            <div style={{ flex: 1, height: 1, background: "#1e1e1e" }} />
                            <span style={{ fontSize: 10, color: "#333", textTransform: "uppercase", letterSpacing: "0.15em", fontWeight: 600 }}>
                                continue with
                            </span>
                            <div style={{ flex: 1, height: 1, background: "#1e1e1e" }} />
                        </div>

                        {/* Google button */}
                        <button
                            onClick={handleGoogleSignIn}
                            disabled={loading}
                            style={{
                                width: "100%", display: "flex", alignItems: "center", justifyContent: "center",
                                gap: 12, padding: "14px 20px", borderRadius: 16, cursor: loading ? "not-allowed" : "pointer",
                                background: "#1c1c1c", border: "1px solid #2a2a2a",
                                opacity: loading ? 0.6 : 1, transition: "all 0.2s",
                                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03)",
                            }}
                            onMouseEnter={(e) => {
                                if (!loading) (e.currentTarget as HTMLElement).style.borderColor = "rgba(249,115,22,0.3)";
                            }}
                            onMouseLeave={(e) => {
                                (e.currentTarget as HTMLElement).style.borderColor = "#2a2a2a";
                            }}
                        >
                            {loading ? (
                                <>
                                    <svg style={{ animation: "spin 1s linear infinite", width: 16, height: 16, color: "#555" }} viewBox="0 0 24 24" fill="none">
                                        <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    <span style={{ fontSize: 14, color: "#555", fontWeight: 500 }}>Connecting...</span>
                                </>
                            ) : (
                                <>
                                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                                        <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4" />
                                        <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.909-2.259c-.806.54-1.836.86-3.047.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853" />
                                        <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05" />
                                        <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335" />
                                    </svg>
                                    <span style={{ fontSize: 14, color: "#ccc", fontWeight: 500 }}>Sign in with Google</span>
                                </>
                            )}
                        </button>

                        {error && (
                            <div style={{
                                marginTop: 16, display: "flex", alignItems: "center", gap: 10,
                                background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)",
                                borderRadius: 12, padding: "10px 14px",
                            }}>
                                <span style={{ color: "#ef4444", fontSize: 12 }}>✕</span>
                                <p style={{ fontSize: 11, color: "#ef4444", margin: 0 }}>{error}</p>
                            </div>
                        )}

                        <p style={{ textAlign: "center", fontSize: 11, color: "#2a2a2a", marginTop: 24, marginBottom: 0, lineHeight: 1.6 }}>
                            By continuing you agree to our Terms & Privacy Policy
                        </p>
                    </div>

                    {/* Bottom accent */}
                    <div style={{ height: 1, background: "linear-gradient(90deg, transparent, rgba(249,115,22,0.2), transparent)" }} />
                </div>
            </div>

            <style>{`
                @keyframes floatOrb {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    33%      { transform: translateY(-12px) rotate(3deg); }
                    66%      { transform: translateY(-6px) rotate(-2deg); }
                }
                @keyframes cardIn {
                    from { opacity: 0; transform: translateY(24px) scale(0.97); }
                    to   { opacity: 1; transform: translateY(0) scale(1); }
                }
                @keyframes pulseRing {
                    0%   { transform: scale(1);    opacity: 0.6; }
                    70%  { transform: scale(1.18); opacity: 0; }
                    100% { transform: scale(1.18); opacity: 0; }
                }
                @keyframes moodPop {
                    from { opacity: 0; transform: scale(0.6) translateY(8px); }
                    to   { opacity: 1; transform: scale(1) translateY(0); }
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to   { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}