"use client";
import { BackupDashboard } from "@/components/backup/backup-dashboard";
import AdminLayout from "@/components/admin/AdminLayout";

export default function BackupPage() {
  return (
    <AdminLayout
      title="Automated Backup System"
      subtitle="Data Protection • Recovery • Scheduling"
    >
      <div className="bg-[#14161c] border border-white/5 rounded-2xl p-6">
        <BackupDashboard />
      </div>
    </AdminLayout>
  );
}
