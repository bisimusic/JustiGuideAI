import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, 
  Users, 
  Bot, 
  Shield, 
  Settings,
  MoreVertical,
  TrendingUp,
  Mail,
  FileText,
  Link2,
  Gift,
  Target,
  Globe,
  Sparkles,
} from "lucide-react";
"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();
  const { data: stats } = useQuery({
    queryKey: ["/api/dashboard/stats"],
    queryFn: () => api.getDashboardStats(),
  });

  const menuItems = [
    { 
      icon: BarChart3, 
      label: "Dashboard", 
      href: "/admin/dashboard", 
      active: pathname === "/admin" || pathname === "/admin/dashboard" 
    },
    { 
      icon: Users, 
      label: "Lead Management", 
      href: "/admin/leads", 
      badge: stats?.totalLeads || 0, 
      active: pathname === "/admin/leads" 
    },
    { 
      icon: TrendingUp, 
      label: "Revenue Analytics", 
      href: "/admin/investors", 
      active: pathname === "/admin/investors" || pathname === "/admin/analytics-tools"
    },
    { 
      icon: BarChart3, 
      label: "Conversion Funnel", 
      href: "/admin/conversion-funnel", 
      active: pathname === "/admin/conversion-funnel"
    },
    { 
      icon: Target, 
      label: "Conversion Optimization", 
      href: "/admin/conversion-optimization", 
      active: pathname === "/admin/conversion-optimization"
    },
    { 
      icon: FileText, 
      label: "Content Strategy", 
      href: "/admin/content-converter", 
      active: pathname === "/admin/content-converter" || pathname === "/admin/cross-promotion" || pathname === "/admin/lawyer-recruitment"
    },
    { 
      icon: Gift, 
      label: "Referral Program", 
      href: "/admin/referrals", 
      active: pathname === "/admin/referrals"
    },
    { 
      icon: Globe, 
      label: "Mobility ID", 
      href: "/admin/mobility", 
      active: pathname === "/admin/mobility"
    },
    { 
      icon: Shield, 
      label: "Settings", 
      href: "/admin/settings", 
      active: pathname === "/admin/settings"
    },
  ];

  return (
    <aside className="w-64 sidebar-enhanced flex flex-col">
      {/* Logo Section */}
      <div className="p-6 border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="logo-enhanced">
          <div className="logo-icon">
            <span className="text-white">⚖️</span>
          </div>
          <div className="logo-text">
            <h1>JustiGuide</h1>
            <p>Immigration Intelligence Platform</p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {menuItems.map((item) => (
          <Link key={item.label} href={item.href} className="block">
            <Button
              variant={item.active ? "default" : "ghost"}
              className={`w-full justify-start text-sm font-medium transition-all duration-200 ${
                item.active 
                  ? "text-white shadow-lg" 
                  : "hover:transform hover:translate-y-[-1px] hover:shadow-md"
              }`}
              style={{
                background: item.active ? 'var(--gradient-1)' : 'transparent',
                color: item.active ? 'white' : 'var(--text-secondary)',
                border: item.active ? 'none' : '1px solid transparent'
              }}
            >
              <item.icon className="mr-3 h-4 w-4" />
              {item.label}
              {item.badge && (
                <Badge 
                  variant="secondary"
                  className="ml-auto text-xs"
                  style={{
                    background: 'var(--gradient-success)',
                    color: 'white',
                    border: 'none'
                  }}
                >
                  {item.badge}
                </Badge>
              )}
            </Button>
          </Link>
        ))}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center space-x-3">
          <Avatar className="w-12 h-12 ring-2 ring-offset-2 ring-green-500">
            <AvatarImage src="https://media.licdn.com/dms/image/v2/D4E03AQGKoUL7WJf8Fw/profile-displayphoto-shrink_100_100/profile-displayphoto-shrink_100_100/0/1698780527932" alt="Bisi Obateru Profile" />
            <AvatarFallback className="text-white font-semibold" style={{ background: 'var(--gradient-1)' }}>BO</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate" style={{ color: 'var(--text)' }}>Bisi Obateru</p>
            <p className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>bisi@busybisi.com</p>
            <div className="flex items-center mt-1">
              <div className="live-dot mr-1"></div>
              <span className="text-xs font-medium" style={{ color: 'var(--success)' }}>LinkedIn Connected</span>
            </div>
          </div>
          <Button variant="ghost" size="sm">
            <MoreVertical className="h-4 w-4" style={{ color: 'var(--text-secondary)' }} />
          </Button>
        </div>
      </div>
    </aside>
  );
}
