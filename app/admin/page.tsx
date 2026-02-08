export default function AdminPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <p className="text-gray-600 text-center">
        Admin is temporarily disabled for deployment. Restore from{" "}
        <code className="text-sm bg-gray-200 px-1 rounded">.disabled-pages/admin-app</code> to re-enable.
      </p>
    </div>
  );
}
