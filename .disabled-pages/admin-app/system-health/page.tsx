"use client";
import SystemHealthDashboard from "@/components/system/system-health-dashboard";
import AdminLayout from '@/components/admin/AdminLayout';

export default function SystemHealth() {
  return (
    <AdminLayout
      title="System Health"
      subtitle="Monitor system performance, database status, and service health"
    >
      <div className="bg-[#14161c] border border-white/5 rounded-2xl p-6">
        <SystemHealthDashboard />
      </div>
    </AdminLayout>
  );
}
