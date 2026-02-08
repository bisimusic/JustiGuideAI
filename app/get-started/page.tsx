"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";

const YOUTUBE_VIDEO_URL = "https://youtu.be/ALWLIRy2K6g";

export default function GetStartedPage() {
  return (
    <div
      className="min-h-screen bg-white flex flex-col items-center justify-center px-4"
      style={{ fontFamily: "Nunito, sans-serif" }}
    >
      <div className="max-w-xl w-full text-center space-y-8">
        <h1 className="text-3xl md:text-4xl font-bold text-[#0F172A]">
          Get started with JustiGuide
        </h1>
        <p className="text-lg text-slate-600">
          Watch our short video to see how JustiGuide can help you with your
          immigration journey.
        </p>
        <Button
          asChild
          size="lg"
          className="bg-gradient-to-r from-[#0F172A] to-[#1E293B] hover:from-[#1E293B] hover:to-[#334155] text-white text-lg px-8 py-6 rounded-lg shadow-lg"
        >
          <a
            href={YOUTUBE_VIDEO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2"
          >
            <Play className="h-5 w-5" fill="currentColor" />
            Get started
          </a>
        </Button>
        <p className="text-sm text-slate-500">
          Opens the video in a new tab.
        </p>
        <Link
          href="/"
          className="inline-block text-slate-600 hover:text-[#0F172A] underline underline-offset-2"
        >
          ← Back to home
        </Link>
      </div>
    </div>
  );
}
