"use client";
import CacheManagement from "@/components/cache-management";
import AdminLayout from "@/components/admin/AdminLayout";

export default function CacheManagementPage() {
  return (
    <AdminLayout
      title="Cache Management"
      subtitle="Manage application cache and optimize performance"
    >
      <div className="bg-[#14161c] border border-white/5 rounded-2xl p-6">
        <CacheManagement />
      </div>
    </AdminLayout>
  );
}
