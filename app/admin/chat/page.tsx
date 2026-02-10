"use client";
import AdminLayout from "@/components/admin/AdminLayout";
import ChatInterface from "@/components/chat/ChatInterface";

export default function ChatPage() {
  return (
    <AdminLayout
      title="AI Chat Assistant"
      subtitle="Get instant insights about your leads, analytics, and platform performance"
    >
      <div className="h-[calc(100vh-200px)] min-h-[600px]">
        <ChatInterface />
      </div>
    </AdminLayout>
  );
}
