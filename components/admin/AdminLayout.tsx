"use client";
import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { 
  BarChart3, Users, TrendingUp, Zap, FileText, Mail, Gift, Target, 
  Settings, Activity, Brain, Shield, Clock, RefreshCw, Send, MessageSquare
} from "lucide-react";

interface AdminLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  headerActions?: ReactNode;
}

export default function AdminLayout({ children, title, subtitle, headerActions }: AdminLayoutProps) {
  const pathname = usePathname();
  
  const { data: stats } = useQuery({
    queryKey: ["/api/dashboard/stats"],
    queryFn: async () => {
      try {
        return await api.getDashboardStats();
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        return { totalLeads: 0 };
      }
    },
    refetchInterval: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const totalLeads = stats?.totalLeads || 0;

  const navItems = [
    {
      group: "Overview",
      items: [
        { icon: BarChart3, label: "Dashboard", href: "/admin/dashboard" },
        { icon: Users, label: "Lead Management", href: "/admin/leads", badge: totalLeads },
        { icon: TrendingUp, label: "Revenue Analytics", href: "/admin/investors" },
      ]
    },
    {
      group: "Optimization",
      items: [
        { icon: Zap, label: "Conversion Funnel", href: "/admin/conversion-funnel" },
        { icon: Target, label: "Conversion Optimization", href: "/admin/conversion-optimization" },
        { icon: FileText, label: "Content Strategy", href: "/admin/content-strategy" },
      ]
    },
    {
      group: "Engage",
      items: [
        { icon: Users, label: "Contacts", href: "/admin/contacts" },
        { icon: Mail, label: "Newsletter", href: "/admin/newsletter" },
        { icon: Gift, label: "Referral Program", href: "/admin/referrals" },
        { icon: MessageSquare, label: "AI Chat", href: "/admin/chat" },
      ]
    },
    {
      group: "Analytics",
      items: [
        { icon: BarChart3, label: "Analytics", href: "/admin/analytics" },
        { icon: Activity, label: "Stage Analytics", href: "/admin/stage-analytics" },
      ]
    },
    {
      group: "System",
      items: [
        { icon: Settings, label: "Settings", href: "/admin/settings" },
        { icon: Activity, label: "System Health", href: "/admin/system-health" },
        { icon: FileText, label: "Cache", href: "/admin/cache" },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#0a0b0d] text-[#f5f5f7]">
      {/* Animated background gradient */}
      <div 
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: `
            radial-gradient(ellipse 80% 50% at 20% -20%, rgba(0, 212, 170, 0.08) 0%, transparent 50%),
            radial-gradient(ellipse 60% 40% at 80% 100%, rgba(167, 139, 250, 0.06) 0%, transparent 50%)
          `
        }}
      />

      <div className="flex min-h-screen relative z-10">
        {/* Sidebar */}
        <aside className="w-[260px] bg-[#111318] border-r border-white/5 flex flex-col fixed h-screen z-50">
          {/* Logo Section */}
          <div className="p-6 border-b border-white/5">
            <Link href="/admin/dashboard" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#00d4aa] to-[#00b894] rounded-[10px] flex items-center justify-center font-['Fraunces',serif] font-bold text-lg text-[#0a0b0d]">
                J
              </div>
              <div className="flex flex-col">
                <span className="font-['Fraunces',serif] font-semibold text-lg text-[#f5f5f7] tracking-tight">JustiGuide</span>
                <span className="text-[11px] text-[#5a5d66] uppercase tracking-wide">GTM Engine</span>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 overflow-y-auto">
            {navItems.map((group, groupIdx) => (
              <div key={groupIdx} className="mb-6">
                <div className="text-[10px] font-semibold text-[#5a5d66] uppercase tracking-wider px-3 py-2">
                  {group.group}
                </div>
                {group.items.map((item) => {
                  const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 px-3.5 py-3 rounded-[10px] text-sm font-medium transition-all relative ${
                        isActive
                          ? "bg-[rgba(0,212,170,0.15)] text-[#00d4aa]"
                          : "text-[#8e919a] hover:bg-[#181b22] hover:text-[#f5f5f7]"
                      }`}
                    >
                      {isActive && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-[#00d4aa] rounded-r" />
                      )}
                      <item.icon className="w-5 h-5 opacity-70" />
                      {item.label}
                      {item.badge && (
                        <span className="ml-auto bg-[#00d4aa] text-[#0a0b0d] text-[11px] font-bold px-2 py-0.5 rounded-full font-['JetBrains_Mono',monospace]">
                          {item.badge.toLocaleString()}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>

          {/* User Section */}
          <div className="p-4 border-t border-white/5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-[10px] bg-gradient-to-br from-[#fb923c] to-[#f97316] flex items-center justify-center font-semibold text-sm">
              BO
            </div>
            <div className="flex-1">
              <div className="font-semibold text-sm text-[#f5f5f7]">Bisi Obateru</div>
              <div className="text-xs text-[#5a5d66]">Founder & CEO</div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 ml-[260px] p-8">
          {/* Header */}
          {(title || headerActions) && (
            <header className="mb-8">
              <div className="flex items-start justify-between mb-4">
                {title && (
                  <div className="flex flex-col gap-2">
                    <h1 className="font-['Fraunces',serif] text-[32px] font-semibold tracking-tight text-[#f5f5f7]">
                      {title}
                    </h1>
                    {subtitle && (
                      <p className="text-sm text-[#8e919a]">{subtitle}</p>
                    )}
                  </div>
                )}
                {headerActions && (
                  <div className="flex gap-3 items-center">
                    {headerActions}
                  </div>
                )}
              </div>
            </header>
          )}

          {/* Page Content */}
          <div className="relative z-10">
            {children}
          </div>
        </main>
      </div>

      <style jsx global>{`
        ::-webkit-scrollbar {
          width: 6px;
        }
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        ::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.15);
        }
      `}</style>
    </div>
  );
}
