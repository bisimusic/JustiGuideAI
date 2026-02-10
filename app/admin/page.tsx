'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/admin/dashboard');
  }, [router]);
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <p className="text-gray-600">Redirecting to admin dashboard…</p>
    </div>
  );
}
