"use client";
import { BackupDashboard } from "@/components/backup/backup-dashboard";
import Sidebar from "@/components/layout/sidebar";

export default function BackupPage() {
  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Automated Backup System</h1>
              <p className="text-purple-100 mt-1">Data Protection • Recovery • Scheduling</p>
              <div className="flex items-center space-x-4 mt-2">
                <span className="text-sm bg-purple-500 px-2 py-1 rounded">Automated Daily</span>
                <span className="text-sm bg-blue-500 px-2 py-1 rounded">Git Commits</span>
                <span className="text-sm bg-green-500 px-2 py-1 rounded">Database Snapshots</span>
              </div>
            </div>
          </div>
        </div>

        {/* Backup Dashboard Content */}
        <div className="p-6">
          <BackupDashboard />
        </div>
      </main>
    </div>
  );
}