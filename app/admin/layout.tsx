import ProtectedRoute from "../components/ProtectedRoute";
import AdminSidebar from "../components/AdminSidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#f7f7f4] lg:flex">
        <AdminSidebar />

        <div className="min-w-0 flex-1 pb-32 lg:pb-0">{children}</div>
      </div>
    </ProtectedRoute>
  );
}
