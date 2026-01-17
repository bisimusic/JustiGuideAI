"use client";
import { ConversionOptimizationDashboard } from '@/components/conversion-optimization/ConversionOptimizationDashboard';
import Sidebar from "@/components/layout/sidebar";

export default function ConversionOptimizationPage() {
  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900" data-testid="conversion-optimization-page">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-gray-900">
          <div className="container mx-auto px-6 py-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Conversion Optimization
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Optimize your 5 responses for maximum conversions through A/B testing and specialized strategies by visa path
              </p>
            </div>
            
            <ConversionOptimizationDashboard />
          </div>
        </main>
      </div>
    </div>
  );
}