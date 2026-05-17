"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";

import LoadingScreen from "../components/LoadingScreen";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isAdmin, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return <LoadingScreen text="Checking access..." />;
  }

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f7f4] px-4">
        <div className="rounded-[2rem] bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-50">
            <Lock className="text-gray-400" size={26} />
          </div>

          <p className="mt-4 text-lg font-black text-gray-950">
            Redirecting to login
          </p>
        </div>
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f7f4] px-4">
        <div className="max-w-md rounded-[2rem] bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50">
            <Lock className="text-red-500" size={26} />
          </div>

          <h1 className="mt-4 text-xl font-black text-gray-950">
            Access denied
          </h1>

          <p className="mt-2 text-sm leading-6 text-gray-500">
            Your account is logged in, but it is not added as an admin.
          </p>
        </div>
      </main>
    );
  }

  return <>{children}</>;
}
