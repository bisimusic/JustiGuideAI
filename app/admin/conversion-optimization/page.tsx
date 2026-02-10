"use client";
import { ConversionOptimizationDashboard } from '@/components/conversion-optimization/ConversionOptimizationDashboard';
import AdminLayout from '@/components/admin/AdminLayout';

export default function ConversionOptimizationPage() {
  return (
    <AdminLayout
      title="Conversion Optimization"
      subtitle="Optimize your 5 responses for maximum conversions through A/B testing and specialized strategies by visa path"
    >
      <div className="bg-[#14161c] border border-white/5 rounded-2xl p-6">
        <ConversionOptimizationDashboard />
      </div>
    </AdminLayout>
  );
}
