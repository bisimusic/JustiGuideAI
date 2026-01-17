import { Play, Users, Brain, Zap, TrendingUp, Shield, Award, Tv } from "lucide-react";
import logoImage from "@assets/file-VqtLhVngyJTcoRdkTestqJ-Guarder Icon - Transparent_1759804664573.png";

interface FeatureVideo {
  id: string;
  title: string;
  description: string;
  youtubeId?: string;
  googleDriveId?: string;
  category: string;
  icon: any;
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
    <div className="min-h-screen bg-white" style={{ fontFamily: 'Nunito, sans-serif' }}>
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex justify-between items-center">
            <a href="/" className="flex items-center gap-3">
              <img src={logoImage} alt="JustiGuide Logo" className="w-10 h-10" data-testid="logo-image" />
              <span className="text-2xl font-bold text-gray-900">JustiGuide</span>
            </a>
            
            <div className="hidden md:flex items-center gap-12">
              <a href="/#how-it-works" className="text-[#475569] hover:text-[#6B5FCF] font-medium text-[15px] transition-colors">About Us</a>
              <a href="/#features" className="text-[#475569] hover:text-[#6B5FCF] font-medium text-[15px] transition-colors">Benefits</a>
              <a href="/features" className="text-[#6B5FCF] font-medium text-[15px]">Feature Videos</a>
              <a href="/#contact" className="text-[#475569] hover:text-[#6B5FCF] font-medium text-[15px] transition-colors">Contact Us</a>
            </div>

            <a
              href="/#waitlist"
              className="bg-gradient-to-r from-[#6B5FCF] to-[#5B8DEE] text-white px-7 py-3 rounded-full font-semibold text-[15px] hover:shadow-[0_8px_20px_rgba(107,95,207,0.3)] hover:-translate-y-0.5 transition-all"
              data-testid="nav-cta"
            >
              Join Waitlist
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-[100px] pb-20 bg-gradient-to-b from-white to-gray-50 overflow-hidden">
        {/* Blob decoration */}
        <div className="absolute top-12 right-0 w-[600px] h-[600px] bg-gradient-to-br from-[#6B5FCF]/10 to-[#5B8DEE]/10 rounded-full opacity-30 blur-[100px]"></div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center max-w-[900px] mx-auto">
            {/* TIME Best Inventions Badge */}
            <a 
              href="https://time.com/collections/best-inventions-2025/7318500/justiguide-relo/" 
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 bg-white border border-gray-200 text-gray-900 px-6 py-3 rounded-full font-medium text-base mb-8 hover:border-gray-300 hover:shadow-md transition-all"
              data-testid="badge-time-inventions"
            >
              <Award className="h-5 w-5 text-gray-700" />
              <span>TIME Best Inventions 2025</span>
            </a>

            <h1 className="text-[56px] md:text-[56px] font-bold text-[#0F172A] mb-6 leading-[1.1]">
              See JustiGuide <span className="bg-gradient-to-r from-[#6B5FCF] to-[#5B8DEE] bg-clip-text text-transparent">In Action</span>
            </h1>

            <p className="text-xl text-[#94A3B8] mb-12 max-w-2xl mx-auto leading-[1.7]">
              Watch how our AI-powered platform transforms immigration services and connects 
              immigrant communities with qualified lawyers.
            </p>

            <div className="flex gap-4 justify-center mb-12 flex-wrap">
              <a
                href="https://calendly.com/bisivc/justiguide-demo"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gradient-to-r from-[#6B5FCF] to-[#5B8DEE] text-white px-8 py-4 rounded-full font-semibold text-base shadow-[0_4px_20px_rgba(107,95,207,0.25)] hover:shadow-[0_8px_30px_rgba(107,95,207,0.35)] hover:-translate-y-0.5 transition-all"
                data-testid="button-schedule-demo"
              >
                Schedule a Demo
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Achievements Banner */}
      <section className="py-12 bg-gradient-to-r from-[#6B5FCF] to-[#5B8DEE]" data-testid="section-achievements">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16">
            <div className="flex items-center gap-3 text-white">
              <Award className="w-8 h-8" />
              <div>
                <p className="text-sm font-medium opacity-90">Selected As</p>
                <p className="text-lg font-bold">TIME Best Inventions 2025</p>
              </div>
            </div>
            
            <div className="hidden md:block w-px h-12 bg-white/30"></div>
            
            <div className="flex items-center gap-3 text-white">
              <Award className="w-8 h-8" />
              <div>
                <p className="text-sm font-medium opacity-90">Winner</p>
                <p className="text-lg font-bold">TechCrunch Best Showcase Pitch 2025</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Video Grid Section */}
      <section className="py-[100px] bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-[#6B5FCF] uppercase tracking-wider mb-4">PLATFORM DEMOS</p>
            <h2 className="text-[48px] font-bold text-[#0F172A] mb-5">
              Feature Videos
            </h2>
            <p className="text-xl text-[#475569] max-w-3xl mx-auto leading-relaxed">
              Explore our powerful features through video demonstrations.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-10">
            {featureVideos.map((video) => (
              <div 
                key={video.id} 
                className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-2xl transition-all duration-300"
                data-testid={`video-card-${video.id}`}
              >
                {/* Video Player */}
                <div className="relative w-full bg-black" style={{ paddingBottom: '56.25%' }}>
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
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 flex flex-col items-center justify-center text-gray-500">
                      <Play className="h-16 w-16 mb-4 opacity-50" />
                      <p className="text-lg font-semibold">Coming Soon</p>
                      <p className="text-sm">Video in production</p>
                    </div>
                  )}
                </div>

                {/* Video Info */}
                <div className="p-8">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-[#6B5FCF]/10 to-[#5B8DEE]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                        <video.icon className="w-5 h-5 text-[#6B5FCF]" />
                      </div>
                      <div>
                        <span className="inline-block px-3 py-1 bg-[#E8E5FF] text-[#6B5FCF] text-xs font-semibold rounded-full">
                          {video.category}
                        </span>
                      </div>
                    </div>
                    <span className="text-sm text-gray-500 font-medium">{video.duration}</span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-[#0F172A] mb-3">{video.title}</h3>
                  <p className="text-base text-[#475569] leading-relaxed">
                    {video.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-[100px] bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-[#6B5FCF] uppercase tracking-wider mb-4">BY THE NUMBERS</p>
            <h2 className="text-[48px] font-bold text-[#0F172A] mb-5">
              Platform Performance
            </h2>
          </div>

          <div className="flex justify-center gap-20 flex-wrap">
            <div className="text-center">
              <h3 className="text-5xl font-bold text-[#6B5FCF] mb-2">47K+</h3>
              <p className="text-[#475569]">Assisted Users</p>
            </div>
            <div className="text-center">
              <h3 className="text-5xl font-bold text-[#6B5FCF] mb-2">1M+</h3>
              <p className="text-[#475569]">AI Responses Generated</p>
            </div>
            <div className="text-center">
              <h3 className="text-5xl font-bold text-[#6B5FCF] mb-2">59%</h3>
              <p className="text-[#475569]">Lead Engagement Rate</p>
            </div>
            <div className="text-center">
              <h3 className="text-5xl font-bold text-[#6B5FCF] mb-2">$123M</h3>
              <p className="text-[#475569]">Pipeline Value</p>
            </div>
            <div className="text-center">
              <h3 className="text-5xl font-bold text-[#6B5FCF] mb-2">24/7</h3>
              <p className="text-[#475569]">AI Monitoring</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-[100px] bg-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl p-8 shadow-2xl">
            <div className="bg-gradient-to-r from-[#6B5FCF] to-[#5B8DEE] rounded-xl p-12">
              <h2 className="text-[40px] font-bold text-white mb-6">
                Ready to See JustiGuide in Action?
              </h2>
              <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto leading-relaxed">
                Schedule a demo to see how our AI-powered platform can transform your immigration practice 
                or help you navigate your immigration journey.
              </p>
              <div className="flex items-center justify-center gap-4 flex-wrap">
                <a
                  href="https://calendly.com/bisivc/justiguide-demo"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white text-[#6B5FCF] px-8 py-4 rounded-full font-semibold text-base hover:bg-gray-50 hover:-translate-y-0.5 transition-all"
                  data-testid="button-cta-demo"
                >
                  Schedule a Demo
                </a>
                <a
                  href="/#waitlist"
                  className="bg-transparent text-white px-8 py-4 rounded-full font-semibold text-base border-2 border-white hover:bg-white/10 hover:-translate-y-0.5 transition-all"
                  data-testid="button-cta-waitlist"
                >
                  Join Waitlist
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0F172A] text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <img src={logoImage} alt="JustiGuide Logo" className="w-8 h-8" />
              <span className="text-xl font-bold">JustiGuide</span>
            </div>
            <div className="flex gap-8 text-sm">
              <a href="/" className="hover:text-[#6B5FCF] transition-colors">Home</a>
              <a href="/features" className="hover:text-[#6B5FCF] transition-colors">Features</a>
              <a href="/press" className="hover:text-[#6B5FCF] transition-colors">Press</a>
              <a href="/#contact" className="hover:text-[#6B5FCF] transition-colors">Contact</a>
            </div>
          </div>
          <div className="text-center mt-8 text-sm text-gray-400">
            © 2025 JustiGuide. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
