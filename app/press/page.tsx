"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Award, Trophy, Sparkles, Rocket } from "lucide-react";
const logoImage = "/assets/file-VqtLhVngyJTcoRdkTestqJ-Guarder Icon - Transparent_1759804664573.png";

export default function PressPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* SEO Meta Tags */}
      <title>Press & Media - JustiGuide | TIME Best Inventions & TechCrunch Best Pitch Winner 2025</title>
      <meta name="description" content="JustiGuide: TIME Best Inventions 2025 & TechCrunch Disrupt Best Pitch Winner 2025. Award-winning AI immigration platform turning bureaucratic nightmares into seamless infrastructure." />
      <meta property="og:title" content="Press & Media - JustiGuide | TIME Best Inventions & TechCrunch Best Pitch Winner 2025" />
      <meta property="og:description" content="JustiGuide recognized by TIME Magazine as Best Invention 2025 and won Best Showcase Stage Pitch at TechCrunch Disrupt 2025 for revolutionizing immigration legal services with AI." />
      <meta property="og:type" content="website" />

      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <a href="/" className="flex items-center space-x-3">
              <img src={logoImage} alt="JustiGuide Logo" className="w-10 h-10" />
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                JustiGuide
              </span>
            </a>
            <nav className="flex space-x-6">
              <a href="/" className="text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 transition-colors">
                Home
              </a>
              <a href="/press" className="text-blue-600 dark:text-blue-400 font-semibold">
                Press
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-orange-100 dark:bg-orange-900/30 px-6 py-3 rounded-full mb-6">
            <Trophy className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            <span className="text-orange-800 dark:text-orange-200 font-semibold">
              TIME Best Inventions 2025 • TechCrunch Best Pitch Winner 2025
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Press & Media
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            JustiGuide is revolutionizing immigration legal services with AI-powered technology, 
            recognized by TIME Magazine, TechCrunch Disrupt, and backed by Reddit's Developer Funds program.
          </p>
        </div>

        {/* Featured Press */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {/* TIME Best Inventions */}
          <Card className="border-2 border-yellow-400 dark:border-yellow-600 shadow-lg hover:shadow-xl transition-shadow" data-testid="card-press-time">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <Badge className="bg-yellow-500 text-white mb-3">Featured</Badge>
                  <CardTitle className="text-2xl mb-2">TIME Best Inventions 2025</CardTitle>
                  <p className="text-gray-600 dark:text-gray-300">
                    Recognized as one of the 300 most groundbreaking inventions of 2025
                  </p>
                </div>
                <Award className="h-12 w-12 text-yellow-500" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                "We're not just building software; we're creating pathways for global talent to contribute to American innovation." 
                - Bisi Obateru, Founder. TIME recognized JustiGuide's ReLo platform for helping 51+ million immigrants navigate visa, work permit, and asylum processes.
              </p>
              <a
                href="https://time.com/collections/best-inventions-2025/7318500/justiguide-relo/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold transition-colors"
                data-testid="link-time-article"
              >
                Read the full TIME article
                <ExternalLink className="h-4 w-4 ml-2" />
              </a>
            </CardContent>
          </Card>

          {/* TechCrunch Disrupt Battlefield */}
          <Card className="border-2 border-green-400 dark:border-green-600 shadow-lg hover:shadow-xl transition-shadow" data-testid="card-press-techcrunch">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <Badge className="bg-green-500 text-white mb-3">🏆 Winner</Badge>
                  <CardTitle className="text-2xl mb-2">TechCrunch Disrupt Battlefield 2025</CardTitle>
                  <p className="text-gray-600 dark:text-gray-300">
                    Best Showcase Stage Pitch - Policy + Protection Category
                  </p>
                </div>
                <Rocket className="h-12 w-12 text-green-500" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                <strong>"Turning immigration from bureaucratic nightmare into seamless infrastructure."</strong> JustiGuide won Best Pitch among 200 startups in the Policy + Protection category at TechCrunch Disrupt 2025.
              </p>
              <div className="space-y-2">
                <a
                  href="https://techcrunch.com/2025/11/07/techcrunch-disrupt-2025s-startup-battlefield-200-celebrating-outstanding-achievements/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold transition-colors"
                  data-testid="link-techcrunch-award"
                >
                  Read about our award
                  <ExternalLink className="h-4 w-4 ml-2" />
                </a>
                <br />
                <a
                  href="https://techcrunch.com/2025/08/27/the-2025-startup-battlefield-200-is-here-see-who-made-the-cut/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold transition-colors"
                  data-testid="link-techcrunch-disrupt"
                >
                  Battlefield 200 announcement
                  <ExternalLink className="h-4 w-4 ml-2" />
                </a>
              </div>
            </CardContent>
          </Card>

          {/* Reddit Developer Funds */}
          <Card className="border-2 border-orange-400 dark:border-orange-600 shadow-lg hover:shadow-xl transition-shadow" data-testid="card-press-reddit">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <Badge className="bg-orange-500 text-white mb-3">Program</Badge>
                  <CardTitle className="text-2xl mb-2">Reddit Developer Funds 2025</CardTitle>
                  <p className="text-gray-600 dark:text-gray-300">
                    Participating in Reddit's prestigious developer funding program
                  </p>
                </div>
                <Sparkles className="h-12 w-12 text-orange-500" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                JustiGuide's Devvit app provides free immigration consultations directly on Reddit, 
                helping thousands of immigrants navigate complex legal processes with AI-powered guidance.
              </p>
              <a
                href="https://support.reddithelp.com/hc/en-us/articles/27958169342996-Reddit-Developer-Funds-2025-Terms"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold transition-colors"
                data-testid="link-reddit-devfunds"
              >
                Learn about Reddit Developer Funds
                <ExternalLink className="h-4 w-4 ml-2" />
              </a>
            </CardContent>
          </Card>
        </div>

        {/* Key Achievements */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            Key Achievements
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card data-testid="card-achievement-ai">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="bg-blue-100 dark:bg-blue-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">AI Innovation</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Pioneering AI-powered immigration case analysis and automated content provision
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-achievement-access">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="bg-green-100 dark:bg-green-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Award className="h-8 w-8 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Access to Justice</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Making immigration legal services affordable and accessible to all
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-achievement-impact">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="bg-purple-100 dark:bg-purple-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Trophy className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Global Impact</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Serving immigrant communities worldwide with intelligent automation and marketplace services
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Media Resources */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            Media Resources
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">About JustiGuide</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                JustiGuide is an AI-powered immigration legal platform that connects immigrants with qualified 
                lawyers through automated lead generation, intelligent case analysis, and a comprehensive 
                marketplace. Our mission is to democratize access to immigration legal services.
              </p>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                <li>• <strong>Founded:</strong> 2024</li>
                <li>• <strong>Platform:</strong> AI-powered marketplace for matching immigrants</li>
                <li>• <strong>Revenue Model:</strong> B2B legal services</li>
                <li>• <strong>Recognition:</strong> TIME Best Inventions 2025</li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Media Contact</h3>
              <div className="space-y-3 text-gray-600 dark:text-gray-300">
                <p>
                  <strong>Email:</strong>{" "}
                  <a href="mailto:press@justiguide.com" className="text-blue-600 dark:text-blue-400 hover:underline">
                    press@justiguide.com
                  </a>
                </p>
                <p>
                  <strong>Website:</strong>{" "}
                  <a href="https://www.justiguide.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">
                    www.justiguide.com
                  </a>
                </p>
                <p>
                  <strong>Reddit App:</strong>{" "}
                  <a href="https://developers.reddit.com/apps/jgmobile" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">
                    JustiGuide Immigration Consultation
                  </a>
                </p>
              </div>
              <div className="mt-6">
                <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">Download Assets</h4>
                <div className="flex space-x-3">
                  <a href="#" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                    Logo Pack
                  </a>
                  <a href="#" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                    Press Kit
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Press Mentions */}
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            In the News
          </h2>
          <div className="space-y-4">
            <Card data-testid="card-news-time">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <Badge variant="outline">TIME Magazine</Badge>
                      <span className="text-sm text-gray-500">October 9, 2025</span>
                    </div>
                    <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                      JustiGuide's ReLo Platform Named Best Invention 2025
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      AI-powered multilingual dashboard helps 51M+ immigrants navigate visas, work permits, and asylum with real-time consultant access
                    </p>
                  </div>
                  <ExternalLink className="h-5 w-5 text-gray-400" />
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-news-techcrunch-award">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <Badge variant="outline">TechCrunch</Badge>
                      <span className="text-sm text-gray-500">November 7, 2025</span>
                    </div>
                    <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                      🏆 JustiGuide Wins Best Showcase Stage Pitch at Disrupt 2025
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-2">
                      "Turning immigration from bureaucratic nightmare into seamless infrastructure" - JustiGuide wins Best Pitch in Policy + Protection category
                    </p>
                    <a
                      href="https://techcrunch.com/2025/11/07/techcrunch-disrupt-2025s-startup-battlefield-200-celebrating-outstanding-achievements/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold transition-colors"
                      data-testid="link-techcrunch-award-article"
                    >
                      Read the full article
                      <ExternalLink className="h-4 w-4 ml-2" />
                    </a>
                  </div>
                  <ExternalLink className="h-5 w-5 text-gray-400" />
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-news-techcrunch">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <Badge variant="outline">TechCrunch</Badge>
                      <span className="text-sm text-gray-500">August 27, 2025</span>
                    </div>
                    <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                      JustiGuide Selected for Startup Battlefield 200
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Out of thousands of applicants, JustiGuide selected as one of 200 most promising startups to showcase at TechCrunch Disrupt
                    </p>
                  </div>
                  <ExternalLink className="h-5 w-5 text-gray-400" />
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-news-reddit">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <Badge variant="outline">Reddit</Badge>
                      <span className="text-sm text-gray-500">October 2025</span>
                    </div>
                    <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                      Participating in Reddit Developer Funds 2025
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Platform brings free immigration consultations to Reddit communities through Devvit app
                    </p>
                  </div>
                  <ExternalLink className="h-5 w-5 text-gray-400" />
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-news-kron">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <Badge variant="outline">KRON TV</Badge>
                      <span className="text-sm text-gray-500">2025</span>
                    </div>
                    <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                      JustiGuide Featured on KRON TV
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Founder Bisi Obateru discusses how AI is transforming immigration legal services
                    </p>
                    <a
                      href="https://youtu.be/86DgYAuBRpA?si=95u9BB1Fu7z3y5Sz"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold mt-2 transition-colors"
                      data-testid="link-kron-interview"
                    >
                      Watch the interview
                      <ExternalLink className="h-4 w-4 ml-2" />
                    </a>
                  </div>
                  <ExternalLink className="h-5 w-5 text-gray-400" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600 dark:text-gray-300">
            <p>© 2025 JustiGuide. All rights reserved.</p>
            <p className="mt-2">
              <a href="/" className="hover:text-blue-600 dark:hover:text-blue-400">Home</a>
              {" | "}
              <a href="/press" className="hover:text-blue-600 dark:hover:text-blue-400">Press</a>
              {" | "}
              <a href="/privacy-policy" className="hover:text-blue-600 dark:hover:text-blue-400">Privacy</a>
              {" | "}
              <a href="/terms-of-service" className="hover:text-blue-600 dark:hover:text-blue-400">Terms</a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
