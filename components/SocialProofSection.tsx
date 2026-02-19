"use client";

import { useState, useEffect } from "react";

/**
 * Social proof components for the landing page.
 * - SocialProofAvatars: Avatar stack + immigrant count
 * - PressLogos: Press outlet mentions (TechCrunch, TIME, etc.)
 * - PartnerLogos: Trusted by companies (HetDynamics, Shirah)
 */

const AVATAR_COLORS = [
  { bg: "#4A90D9", initials: "MA" },
  { bg: "#E8704A", initials: "NI" },
  { bg: "#50B86C", initials: "PR" },
  { bg: "#9B59B6", initials: "CH" },
  { bg: "#E74C3C", initials: "FA" },
];

export function SocialProofAvatars() {
  const [checkedIn, setCheckedIn] = useState(14);

  useEffect(() => {
    const tick = () => setCheckedIn(12 + Math.floor(Math.random() * 7));
    const interval = setInterval(tick, 12000 + Math.random() * 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-start gap-3">
      <div className="flex items-center gap-3">
        <div className="flex -space-x-2">
          {AVATAR_COLORS.map((a) => (
            <div
              key={a.initials}
              className="w-8 h-8 rounded-full border-2 border-chalk flex items-center justify-center text-[0.7rem] font-bold text-white shrink-0 shadow-sm"
              style={{ backgroundColor: a.bg }}
            >
              {a.initials}
            </div>
          ))}
        </div>
        <p className="text-[0.82rem] text-warm-gray leading-snug">
          <strong className="text-ink">47,000+</strong> immigrants helped
          <br />
          from 180+ countries
        </p>
      </div>
      <p className="text-[0.78rem] text-warm-gray flex items-center gap-1.5">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#0CA87E] opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-[#0CA87E]" />
        </span>
        <strong className="text-ink font-semibold">{checkedIn}</strong> people checked in the last hour
      </p>
    </div>
  );
}

const PRESS_OUTLETS = [
  "TechCrunch",
  "TIME",
  "CBS News",
  "The Guardian",
  "Forbes",
];

const NVIDIA_ICON = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden className="shrink-0">
    <path d="M12.444 6.27c-.592 0-1.072.48-1.072 1.073v9.314c0 .592.48 1.073 1.072 1.073h5.226c.593 0 1.073-.48 1.073-1.073V7.343c0-.593-.48-1.073-1.073-1.073h-5.226z" fill="#76B900" />
    <path d="M6.33 9.843c-.592 0-1.073.48-1.073 1.073v5.741c0 .593.481 1.073 1.073 1.073h3.461c.593 0 1.073-.48 1.073-1.073v-5.74c0-.594-.48-1.074-1.073-1.074H6.33z" fill="#76B900" />
  </svg>
);

export function PressLogos() {
  return (
    <section className="py-10 md:py-12 bg-white border-b border-border">
      <div className="max-w-7xl mx-auto px-6">
        {/* As featured in — outlets only */}
        <p className="text-center text-[0.7rem] font-bold tracking-widest uppercase text-warm-gray mb-5">
          As featured in
        </p>
        <div className="flex flex-wrap justify-center items-center gap-6 md:gap-10 mb-10">
          {PRESS_OUTLETS.map((name) => (
            <span
              key={name}
              className="text-sm md:text-base font-semibold text-warm-gray/80 hover:text-ink transition-colors"
            >
              {name}
            </span>
          ))}
        </div>

        {/* Awards & recognition — one row, consistent badges */}
        <p className="text-center text-[0.65rem] font-bold tracking-widest uppercase text-warm-gray/70 mb-4">
          Awards &amp; recognition
        </p>
        <div className="flex flex-wrap justify-center items-center gap-4 md:gap-6">
          <a
            href="https://techcrunch.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold bg-[#f0f0f0] text-[#1a1a1a] border border-border/60 hover:bg-[#e8e8e8] transition-colors"
          >
            <span className="font-bold text-[#1a1a1a]">TechCrunch</span>
            <span className="text-warm-gray">Battlefield 200</span>
          </a>
          <a
            href="https://time.com/collections/best-inventions-2025/7318500/justiguide-relo/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold bg-[#E8E4DC] text-[#1a1a1a] border border-[#c9c4b8] hover:bg-[#ddd9d0] transition-colors"
          >
            <span className="font-serif font-bold text-[#b72221]">TIME</span>
            <span className="text-[#1a1a1a]">Best Inventions 2025</span>
          </a>
          <span className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold bg-[#f7f7f7] text-[#333] border border-border/60">
            {NVIDIA_ICON}
            <span className="tracking-wide uppercase">NVIDIA Inception 2026</span>
          </span>
        </div>
      </div>
    </section>
  );
}

const PARTNER_NAMES = ["HetDynamics", "Shirah"];

export function PartnerLogos() {
  return (
    <section className="py-12 md:py-16 bg-chalk border-t border-border">
      <div className="max-w-7xl mx-auto px-6">
        <p className="text-center text-[0.7rem] font-bold tracking-widest uppercase text-accent mb-6 flex items-center justify-center gap-2">
          <span className="w-5 h-0.5 bg-accent" /> Trusted by companies
        </p>
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
          {PARTNER_NAMES.map((name) => (
            <span
              key={name}
              className="text-lg md:text-xl font-bold text-ink/70 hover:text-ink transition-colors"
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
