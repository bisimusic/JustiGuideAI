"use client";
import CacheManagement from "@/components/cache-management";
import Sidebar from "@/components/layout/sidebar";

export default function CacheManagementPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="flex-1 p-6">
        <CacheManagement />
      </div>
    </div>
  );
}