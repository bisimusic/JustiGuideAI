"use client";
import { ContentConverter } from '@/components/ContentConverter';
import Sidebar from '@/components/layout/sidebar';

export default function ContentConverterPage() {
  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="flex-1 ml-64">
        <ContentConverter />
      </div>
    </div>
  );
}