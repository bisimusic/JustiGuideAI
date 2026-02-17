"use client";

import { useState, useEffect, useCallback } from "react";

/* Task 2.5 — Social Proof Avatars: live counter, first names, fade animation */

const AVATAR_POOL = [
  { name: "Dylan", photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face" },
  { name: "Maria", photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face" },
  { name: "Amir", photo: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&h=80&fit=crop&crop=face" },
  { name: "Priya", photo: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face" },
  { name: "Chen", photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=face" },
  { name: "Fatima", photo: null, initials: "FA" },
  { name: "Koji", photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face" },
  { name: "Elena", photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&crop=face" },
  { name: "Ravi", photo: null, initials: "RP" },
  { name: "Sofia", photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&h=80&fit=crop&crop=face" },
  { name: "Kwame", photo: null, initials: "KA" },
  { name: "Yuki", photo: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=80&h=80&fit=crop&crop=face" },
  { name: "Liam", photo: null, initials: "LB" },
  { name: "Nia", photo: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=80&h=80&fit=crop&crop=face" },
  { name: "Omar", photo: null, initials: "OE" },
];

const VISIBLE = 6;
const GRAD = [
  ["#1e3a5f", "#4a90d9"],
  ["#2d1b4e", "#8b5cf6"],
  ["#1a3c34", "#10b981"],
  ["#4a1c1c", "#ef4444"],
  ["#3b2f1e", "#f59e0b"],
  ["#1e293b", "#64748b"],
];

export function SocialProofAvatars() {
  const [count, setCount] = useState(7);
  const [visible, setVisible] = useState(() => AVATAR_POOL.slice(0, VISIBLE));
  const [fadingOut, setFadingOut] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setCount((p) => Math.max(3, Math.min(18, p + (Math.random() > 0.4 ? 1 : -1))));
    const id = setInterval(tick, 5000 + Math.random() * 3000);
    return () => clearInterval(id);
  }, []);

  const rotate = useCallback(() => {
    const idx = Math.floor(Math.random() * VISIBLE);
    setFadingOut(idx);
    setTimeout(() => {
      setVisible((prev) => {
        const used = new Set(prev.map((a) => a.name));
        const pool = AVATAR_POOL.filter((a) => !used.has(a.name));
        if (!pool.length) return prev;
        const next = [...prev];
        next[idx] = pool[Math.floor(Math.random() * pool.length)];
        return next;
      });
      setFadingOut(null);
    }, 500);
  }, []);

  useEffect(() => {
    const id = setInterval(rotate, 5000 + Math.random() * 1000);
    return () => clearInterval(id);
  }, [rotate]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex gap-3">
        {visible.map((av, i) => {
          const out = fadingOut === i;
          const [bg, fg] = GRAD[av.name.charCodeAt(0) % GRAD.length];
          return (
            <div
              key={`${av.name}-${i}`}
              className="flex flex-col items-center gap-1.5 transition-all duration-500 ease-out"
              style={{ opacity: out ? 0 : 1, transform: out ? "scale(0.7)" : "scale(1)" }}
            >
              {av.photo ? (
                <img
                  src={av.photo}
                  alt={av.name}
                  className="w-11 h-11 rounded-full object-cover border-[2.5px] border-chalk shadow-[0_2px_8px_rgba(0,0,0,0.12)]"
                />
              ) : (
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center border-[2.5px] border-chalk shadow-[0_2px_8px_rgba(0,0,0,0.12)] text-white text-sm font-bold"
                  style={{ background: `linear-gradient(135deg, ${bg}, ${fg})` }}
                >
                  {av.initials}
                </div>
              )}
              <span className="text-[11px] text-warm-gray font-medium">{av.name}</span>
            </div>
          );
        })}
      </div>
      <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20">
        <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
<span className="text-[13px] text-ink font-semibold tabular-nums">
        {count} people explored visas in the last hour
        </span>
      </div>
    </div>
  );
}

/* Task 4.2 — Press logos: TechCrunch, TIME, CBS News, The Guardian — grayscale, non-clickable */

const PRESS = [
  { id: "tc", width: 140, caption: "Startup Battlefield 200 — Privacy & Protection (2025)", logo: "TechCrunch" },
  { id: "time", width: 70, caption: "Best Inventions 2025", logo: "TIME" },
  { id: "cbs", width: 120, caption: null, logo: "CBS News" },
  { id: "guardian", width: 145, caption: null, logo: "The Guardian" },
];

export function PressLogos() {
  return (
    <div className="flex flex-col items-center gap-8 py-16 px-6">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-warm-gray">As featured in</p>
      <div className="flex flex-wrap items-center justify-center gap-10 max-w-3xl">
        {PRESS.map((p) => (
          <div
            key={p.id}
            className="flex flex-col items-center gap-1.5 cursor-default transition-all duration-300 hover:grayscale-0 hover:opacity-100 grayscale opacity-60 hover:scale-105"
          >
            <div className="h-10 flex items-center justify-center text-warm-gray font-bold text-lg" style={{ width: p.width }}>
              {p.logo}
            </div>
            {p.caption && (
              <span className="text-[10px] text-warm-gray font-medium text-center max-w-[180px] leading-snug">
                {p.caption}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* Partner logos — Trusted by Companies — uses real images for HetDynamics, Shirah */

const PARTNERS = [
  { name: "Inventim", logo: "/assets/logos/inventim.png" },
  { name: "Joinable", logo: "/assets/logos/joinable.png" },
  { name: "Standout", logo: "/assets/logos/standout.png" },
  { name: "Visa Now", logo: "/assets/logos/visa-now.png" },
  { name: "HetDynamics", logo: "/assets/logos/hetdynamics.png" },
  { name: "Shirah", logo: "/assets/logos/shirah.png" },
];

export function PartnerLogos() {
  return (
    <section className="py-12 md:py-16 bg-chalk border-t border-border">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-warm-gray mb-2">Trusted by</p>
          <h2 className="font-display text-xl md:text-2xl font-bold text-ink">Companies Building the Future</h2>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
          {PARTNERS.map((p) => (
            <div
              key={p.name}
              className="h-11 flex items-center justify-center grayscale hover:grayscale-0 opacity-60 hover:opacity-100 transition-all duration-300 cursor-default hover:scale-105 min-w-[100px]"
            >
              <img
                src={p.logo}
                alt={p.name}
                className="h-9 w-auto object-contain max-w-[120px]"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                  const fb = e.currentTarget.nextElementSibling as HTMLElement;
                  if (fb) fb.classList.remove("hidden");
                }}
              />
              <span className="hidden text-warm-gray font-semibold text-sm px-4">{p.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
