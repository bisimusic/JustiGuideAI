"use client";
import SystemHealthDashboard from "@/components/system/system-health-dashboard";

export default function SystemHealth() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto py-8 px-4">
        <SystemHealthDashboard />
      </div>
    </div>
  );
}