"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Home, Lock, Mail } from "lucide-react";
import Link from "next/link";

import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setErrorMessage("");

    try {
      await login(email, password);
      router.push("/admin/properties");
    } catch (error) {
      console.error(error);
      setErrorMessage("Email or password is not correct.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f7f7f4] px-4 py-8 md:px-6">
      <div className="mx-auto grid min-h-[calc(100vh-120px)] max-w-6xl items-center gap-8 lg:grid-cols-2">
        <section className="hidden overflow-hidden rounded-[2.5rem] bg-black p-8 text-white shadow-xl lg:block">
          <div className="flex h-[620px] flex-col justify-between">
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-black">
                <Home size={24} />
              </div>

              <h1 className="mt-8 max-w-md text-5xl font-black leading-tight tracking-tight">
                Manage your property listings easily.
              </h1>

              <p className="mt-5 max-w-md text-base leading-7 text-white/60">
                Login to create, update, and manage rental or sale listings in
                your admin panel.
              </p>
            </div>

            <div className="rounded-[2rem] bg-white/10 p-5 backdrop-blur-md">
              <p className="text-sm text-white/60">Admin area</p>
              <p className="mt-2 text-xl font-bold">
                Secure access for property managers
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-md">
          <Link
            href="/"
            className="mb-6 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-gray-800 shadow-sm"
          >
            <Home size={17} />
            Home
          </Link>

          <div className="rounded-[2.3rem] bg-white p-6 shadow-xl shadow-black/5 md:p-8">
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-[#9a7a3d]">
                Welcome back
              </p>

              <h1 className="mt-2 text-3xl font-black tracking-tight text-gray-950 md:text-4xl">
                Login to admin
              </h1>

              <p className="mt-3 text-sm leading-6 text-gray-500">
                Use your admin email and password to continue.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-bold text-gray-800">
                  Email
                </label>

                <div className="flex items-center gap-3 rounded-2xl bg-gray-50 px-4 py-4">
                  <Mail size={18} className="text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="admin@example.com"
                    required
                    className="w-full bg-transparent text-sm text-gray-900 placeholder:text-gray-400"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-gray-800">
                  Password
                </label>

                <div className="flex items-center gap-3 rounded-2xl bg-gray-50 px-4 py-4">
                  <Lock size={18} className="text-gray-400" />

                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Your password"
                    required
                    className="w-full bg-transparent text-sm text-gray-900 placeholder:text-gray-400"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    className="text-gray-400"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {errorMessage && (
                <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                  {errorMessage}
                </div>
              )}

              <button
                disabled={loading}
                className="w-full rounded-2xl bg-black px-5 py-4 text-sm font-black text-white shadow-sm transition hover:bg-gray-800 disabled:opacity-50"
              >
                {loading ? "Logging in..." : "Login"}
              </button>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}
