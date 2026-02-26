"use client";

import { Play, Users, Brain, TrendingUp, Shield, Award, Tv, ArrowRight } from "lucide-react";

const logoImage = "/assets/file-VqtLhVngyJTcoRdkTestqJ-Guarder Icon - Transparent_1759804664573.png";

interface FeatureVideo {
  id: string;
  title: string;
  description: string;
  youtubeId?: string;
  googleDriveId?: string;
  category: string;
  icon: React.ComponentType<{ className?: string }>;
  duration: string;
}

const featureVideos: FeatureVideo[] = [
  {
    id: "relo-overview",
    title: "The Overview of Relo",
    description: "Comprehensive platform overview showcasing how Relo transforms immigration services with AI-powered lead generation and intelligent matching.",
    youtubeId: "mULHQgR-j90",
    category: "Overview",
    icon: Play,
    duration: "5:00"
  },
  {
    id: "techcrunch-pitch",
    title: "TechCrunch Disrupt Pitch",
    description: "Watch our winning pitch at TechCrunch Disrupt 2025 where we showcased JustiGuide's AI-powered immigration platform.",
    youtubeId: "H996uOUm2UM",
    category: "Overview",
    icon: TrendingUp,
    duration: "3:00"
  },
  {
    id: "live-tv-spot",
    title: "Live TV Spot",
    description: "Watch JustiGuide's live television appearance showcasing how our AI-powered platform is transforming immigration services.",
    youtubeId: "86DgYAuBRpA",
    category: "Media Coverage",
    icon: Tv,
    duration: "2:00"
  },
  {
    id: "lawyer-dashboard",
    title: "Lawyer Dashboard",
    description: "Explore the comprehensive lawyer dashboard with AI-powered lead management, client tracking, and real-time analytics.",
    youtubeId: "5wBBduc9Fwo",
    category: "B2B Services",
    icon: Users,
    duration: "2:30"
  },
  {
    id: "connecting-with-lawyer",
    title: "Connecting with a Lawyer on JustiGuide",
    description: "See how our platform seamlessly connects clients with qualified immigration lawyers through AI-powered matching and automated introductions.",
    youtubeId: "ZI3ZdBXIpOE",
    category: "B2B Services",
    icon: Users,
    duration: "3:15"
  },
  {
    id: "dolores-ai-verified",
    title: "Dolores AI and Verified Information",
    description: "Discover how Dolores AI provides verified information with 99.7% accuracy, trained on 1M+ cases and verified by immigration experts.",
    googleDriveId: "1gLgSIXAwUyypdR0ML_OBkbIlPDeazSJs",
    category: "Core Features",
    icon: Brain,
    duration: "4:00"
  },
  {
    id: "d2c-n400",
    title: "D2C N-400 Citizenship Platform",
    description: "Learn about our $499 direct-to-consumer citizenship application platform that makes naturalization accessible and affordable.",
    youtubeId: "mvejJBOhpqE",
    category: "D2C Services",
    icon: Shield,
    duration: "2:45"
  }
];

export default function AppFeatures() {
  return (
    <div className="min-h-screen bg-chalk font-body">
      {/* Nav — match landing design system */}
      <nav className="sticky top-0 z-50 bg-chalk/95 backdrop-blur-md border-b border-border shadow-[0_1px_0_0_rgba(0,0,0,0.05)]" id="main-nav">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between" style={{ height: "68px" }}>
          <a href="/" className="flex items-center gap-3 font-display text-[1.35rem] text-ink group">
            <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-accent/10 ring-1 ring-accent/20 group-hover:ring-accent/40 transition-all">
              <img src={logoImage} alt="JustiGuide" className="w-6 h-6 object-contain" data-testid="logo-image" />
            </span>
            JustiGuide
          </a>
          <div className="hidden md:flex items-center gap-8">
            <a href="/#how-it-works" className="text-sm font-semibold text-warm-gray hover:text-accent transition-colors">How it works</a>
            <a href="/#features" className="text-sm font-semibold text-warm-gray hover:text-accent transition-colors">Benefits</a>
            <a href="/features" className="text-sm font-semibold text-accent transition-colors">Feature Videos</a>
            <a href="/#contact" className="text-sm font-semibold text-warm-gray hover:text-accent transition-colors">Contact</a>
          </div>
          <a
            href="https://immigrant.justi.guide/assessment"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full font-bold transition-all duration-200 px-7 py-3 text-base bg-accent hover:bg-accent-deep shadow-[0_4px_14px_rgba(107,95,207,0.45)] hover:shadow-[0_8px_24px_rgba(107,95,207,0.5)] hover:-translate-y-0.5 ring-2 ring-accent/30 hover:ring-accent/50"
            style={{ color: "#0B1215" }}
            data-testid="nav-cta"
          >
            Get my roadmap →
          </a>
        </div>
      </nav>

      {/* Hero — design system: chalk → sage, label + bar, font-display */}
      <section className="relative pt-[100px] md:pt-[120px] pb-20 bg-linear-to-b from-chalk to-sage overflow-hidden">
        <div className="absolute top-[-200px] right-[-150px] w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,rgba(107,95,207,0.12)_0%,transparent_65%)] pointer-events-none" aria-hidden />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center max-w-[900px] mx-auto">
            <p className="text-[0.7rem] font-bold tracking-widest uppercase text-accent mb-4 flex items-center justify-center gap-2">
              <span className="w-5 h-0.5 bg-accent" aria-hidden /> Platform demos
            </p>
            <h1 className="font-display text-[clamp(2.5rem,5vw,3.5rem)] font-bold text-ink mb-6 leading-tight">
              See JustiGuide <em className="italic text-accent font-display">in action</em>
            </h1>
            <p className="text-xl text-warm-gray mb-10 max-w-2xl mx-auto leading-relaxed">
              Watch how our AI-powered platform transforms immigration services and connects immigrant communities with qualified lawyers.
            </p>
            <a
              href="https://immigrant.justi.guide/demo/dashboard"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-chalk text-accent border-2 border-accent px-8 py-4 rounded-full font-semibold text-base hover:bg-accent hover:text-ink hover:border-accent shadow-[0_4px_20px_rgba(107,95,207,0.15)] hover:shadow-[0_8px_30px_rgba(107,95,207,0.35)] hover:-translate-y-0.5 transition-all"
              data-testid="button-schedule-demo"
            >
              Schedule a demo <ArrowRight className="w-5 h-5 shrink-0" />
            </a>
          </div>
        </div>
      </section>

      {/* Achievements — single line, match landing */}
      {/* Achievements — Dolores AI color scheme: dark bg + gold accent */}
      <section className="py-12" style={{ backgroundColor: "#121212" }} data-testid="section-achievements">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-[0.7rem] font-bold tracking-widest uppercase mb-4 flex items-center justify-center gap-2" style={{ color: "#D4AF37" }}>
            <span className="w-5 h-0.5 shrink-0" style={{ backgroundColor: "#D4AF37" }} aria-hidden /> Recognition
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
            <Award className="w-8 h-8 shrink-0" style={{ color: "#D4AF37" }} />
            <span className="font-display text-lg md:text-xl text-center" style={{ color: "#E0E0E0" }}>
              TIME Best Inventions 2025 · Tech Disrupt Pitch Showcase Winner &apos;25
            </span>
          </div>
        </div>
      </section>

      {/* Video grid — design system: chalk bg, label + bar, cards with border */}
      <section className="py-[100px] bg-chalk">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-[0.7rem] font-bold tracking-widest uppercase text-accent mb-4 flex items-center justify-center gap-2">
            <span className="w-5 h-0.5 bg-accent" aria-hidden /> Feature videos
          </p>
          <h2 className="font-display text-[clamp(2rem,4vw,3rem)] font-bold text-ink mb-5 text-center">
            Watch the platform
          </h2>
          <p className="text-lg text-warm-gray max-w-2xl mx-auto text-center mb-16 leading-relaxed">
            Explore our features through video demonstrations.
          </p>

          <div className="grid md:grid-cols-2 gap-10">
            {featureVideos.map((video) => (
              <div
                key={video.id}
                className="bg-white rounded-2xl border border-border overflow-hidden hover:shadow-xl transition-all duration-300"
                data-testid={`video-card-${video.id}`}
              >
                <div className="relative w-full bg-ink" style={{ paddingBottom: "56.25%" }}>
                  {video.youtubeId ? (
                    <iframe
                      className="absolute top-0 left-0 w-full h-full"
                      src={`https://www.youtube.com/embed/${video.youtubeId}`}
                      title={video.title}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      data-testid={`video-iframe-${video.id}`}
                    />
                  ) : video.googleDriveId ? (
                    <iframe
                      className="absolute top-0 left-0 w-full h-full"
                      src={`https://drive.google.com/file/d/${video.googleDriveId}/preview`}
                      title={video.title}
                      frameBorder="0"
                      allow="autoplay"
                      allowFullScreen
                      data-testid={`video-iframe-${video.id}`}
                    />
                  ) : (
                    <div className="absolute inset-0 bg-light-gray flex flex-col items-center justify-center text-warm-gray">
                      <Play className="h-16 w-16 mb-4 opacity-50" />
                      <p className="text-lg font-semibold text-ink">Coming soon</p>
                      <p className="text-sm">Video in production</p>
                    </div>
                  )}
                </div>
                <div className="p-8">
                  <div className="flex items-start justify-between mb-4 gap-3">
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="w-10 h-10 bg-accent-light rounded-xl flex items-center justify-center shrink-0">
                        <video.icon className="w-5 h-5 text-accent" />
                      </div>
                      <span className="px-3 py-1 bg-accent-light text-accent text-xs font-semibold rounded-full">
                        {video.category}
                      </span>
                    </div>
                    <span className="text-sm text-warm-gray font-medium">{video.duration}</span>
                  </div>
                  <h3 className="text-xl font-bold text-ink mb-3">{video.title}</h3>
                  <p className="text-base text-warm-gray leading-relaxed">{video.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats — design system: sage bg, font-display, accent numbers */}
      <section className="py-[100px] bg-sage">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-[0.7rem] font-bold tracking-widest uppercase text-accent mb-4 flex items-center justify-center gap-2">
            <span className="w-5 h-0.5 bg-accent" aria-hidden /> By the numbers
          </p>
          <h2 className="font-display text-[clamp(2rem,4vw,3rem)] font-bold text-ink mb-16 text-center">
            Platform performance
          </h2>
          <div className="flex justify-center gap-12 md:gap-20 flex-wrap">
            <div className="text-center">
              <h3 className="font-display text-4xl md:text-5xl font-bold text-accent mb-2">47K+</h3>
              <p className="text-warm-gray">Assisted users</p>
            </div>
            <div className="text-center">
              <h3 className="font-display text-4xl md:text-5xl font-bold text-accent mb-2">1M+</h3>
              <p className="text-warm-gray">AI responses generated</p>
            </div>
            <div className="text-center">
              <h3 className="font-display text-4xl md:text-5xl font-bold text-accent mb-2">99.7%</h3>
              <p className="text-warm-gray">AI accuracy</p>
            </div>
            <div className="text-center">
              <h3 className="font-display text-4xl md:text-5xl font-bold text-accent mb-2">24/7</h3>
              <p className="text-warm-gray">AI monitoring</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA — design system: light card, accent CTAs */}
      <section className="py-[100px] bg-chalk">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="bg-white rounded-2xl p-10 md:p-12 border border-border shadow-xl">
            <h2 className="font-display text-[clamp(2rem,4vw,2.5rem)] font-bold text-ink mb-6">
              Ready to see JustiGuide in action?
            </h2>
            <p className="text-lg text-warm-gray mb-10 max-w-2xl mx-auto leading-relaxed">
              Schedule a demo to see how our AI-powered platform can transform your immigration practice or help you navigate your immigration journey.
            </p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <a
                href="https://immigrant.justi.guide/demo/dashboard"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-chalk text-accent border-2 border-accent px-8 py-4 rounded-full font-semibold text-base hover:bg-accent hover:text-ink hover:border-accent shadow-[0_4px_20px_rgba(107,95,207,0.15)] hover:shadow-[0_8px_30px_rgba(107,95,207,0.35)] hover:-translate-y-0.5 transition-all"
                data-testid="button-cta-demo"
              >
                Schedule a demo <ArrowRight className="w-5 h-5 shrink-0" />
              </a>
              <a
                href="https://immigrant.justi.guide/assessment"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-chalk text-accent border-2 border-accent px-8 py-4 rounded-full font-semibold text-base hover:bg-accent hover:text-ink hover:border-accent transition-all"
                data-testid="button-cta-waitlist"
              >
                Get my roadmap →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer — match landing: ink bg, inline styles for visibility */}
      <footer className="border-t py-12 md:py-14" style={{ backgroundColor: "#0B1215", borderColor: "rgba(255,255,255,0.1)" }}>
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="font-display text-xl md:text-2xl mb-6" style={{ color: "#ffffff" }}>
            JustiGuide
          </div>
          <nav className="mb-6" aria-label="Footer navigation">
            <div className="flex flex-wrap justify-center gap-6 md:gap-8 text-[11px] font-semibold uppercase tracking-wider">
              <a href="/" className="transition-colors hover:opacity-100" style={{ color: "rgba(255,255,255,0.85)" }}>Home</a>
              <a href="/features" className="transition-colors hover:opacity-100" style={{ color: "rgba(255,255,255,0.85)" }}>Feature Videos</a>
              <a href="/press" className="transition-colors hover:opacity-100" style={{ color: "rgba(255,255,255,0.85)" }}>Press</a>
              <a href="/#contact" className="transition-colors hover:opacity-100" style={{ color: "rgba(255,255,255,0.85)" }}>Contact</a>
            </div>
          </nav>
          <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.7)" }}>
            © 2026 JustiGuide. Built by immigrants, for immigrants.
          </p>
        </div>
      </footer>
    </div>
  );
}
