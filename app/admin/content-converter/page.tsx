"use client";
import { ContentConverter } from '@/components/ContentConverter';
import AdminLayout from '@/components/admin/AdminLayout';

export default function ContentConverterPage() {
  return (
    <AdminLayout
      title="Content Converter"
      subtitle="Transform blog content into lead generation assets"
    >
      <div className="bg-[#14161c] border border-white/5 rounded-2xl p-6">
        <ContentConverter />
      </div>
    </AdminLayout>
  );
}
