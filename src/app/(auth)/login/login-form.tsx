"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Building2, Lock, Mail, Loader2 } from "lucide-react";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Email atau password salah. Silakan coba lagi.");
    } else {
      router.push("/");
      router.refresh();
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4">
      {/* Background pattern */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative w-full max-w-md animate-fade-in">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-500/20 border border-blue-400/30 mb-4 backdrop-blur-sm">
            <Building2 className="w-8 h-8 text-blue-400" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">SIMAPO</h1>
          <p className="text-blue-300/80 text-sm mt-1">
            Sistem Manajemen Aset & Persediaan Operasional
          </p>
        </div>

        {/* Card */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-8 shadow-2xl">
          <h2 className="text-lg font-semibold text-white mb-6">Masuk ke Sistem</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-blue-200">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-300/60" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@instansi.go.id"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/10 border border-white/20
                             text-white placeholder-white/30 text-sm
                             focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50
                             transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-blue-200">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-300/60" />
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white/10 border border-white/20
                             text-white placeholder-white/30 text-sm
                             focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50
                             transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-300/60 hover:text-blue-300 transition-colors"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-xl bg-red-500/20 border border-red-400/30 px-4 py-2.5 text-sm text-red-300">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-blue-500 hover:bg-blue-400
                         text-white font-semibold text-sm transition-all
                         disabled:opacity-60 disabled:cursor-not-allowed
                         flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Memverifikasi...
                </>
              ) : (
                "Masuk"
              )}
            </button>
          </form>

          {/* Demo accounts */}
          <div className="mt-6 pt-6 border-t border-white/10">
            <p className="text-xs text-blue-300/60 text-center mb-3">Akun Demo</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "Admin", email: "admin@simapo.go.id" },
                { label: "Pegawai", email: "dewi@simapo.go.id" },
                { label: "Kepala", email: "kadis@simapo.go.id" },
              ].map((acc) => (
                <button
                  key={acc.label}
                  type="button"
                  onClick={() => { setEmail(acc.email); setPassword("password123"); }}
                  className="text-xs py-1.5 px-2 rounded-lg bg-white/5 border border-white/10
                             text-blue-300/70 hover:bg-white/10 hover:text-blue-200 transition-all"
                >
                  {acc.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-blue-400/40 mt-6">
          © 2025 SIMAPO — Instansi Pemerintah Daerah
        </p>
      </div>
    </div>
  );
}
