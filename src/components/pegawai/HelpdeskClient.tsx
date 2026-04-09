// src/components/pegawai/HelpdeskClient.tsx
"use client";

import { useState, useTransition } from "react";
import { Wrench, Plus, Clock, CheckCircle2, AlertCircle, X } from "lucide-react";
import { cn, formatTanggal } from "@/lib/utils";
import { generateNomorTiket } from "@/lib/utils";
import type { TiketKerusakan } from "@prisma/client";

interface Props {
  tiket: TiketKerusakan[];
}

const PRIORITAS_OPTIONS = [
  { value: "LOW",      label: "Rendah",   color: "bg-gray-100 text-gray-700"   },
  { value: "NORMAL",   label: "Normal",   color: "bg-blue-100 text-blue-700"   },
  { value: "HIGH",     label: "Tinggi",   color: "bg-orange-100 text-orange-700"},
  { value: "CRITICAL", label: "Kritis",   color: "bg-red-100 text-red-700"     },
];

const STATUS_INFO: Record<string, { label: string; color: string }> = {
  MENUNGGU_PENGECEKAN: { label: "Menunggu Pengecekan", color: "bg-amber-100 text-amber-700" },
  PROSES_SERVIS:       { label: "Proses Servis",       color: "bg-blue-100 text-blue-700"   },
  SELESAI:             { label: "Selesai",             color: "bg-green-100 text-green-700" },
  DITOLAK:             { label: "Ditolak",             color: "bg-red-100 text-red-700"     },
};

export function HelpdeskClient({ tiket }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const fd = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await fetch("/api/tiket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nomorTiket: generateNomorTiket(),
          judul: fd.get("judul"),
          deskripsi: fd.get("deskripsi"),
          prioritas: fd.get("prioritas"),
          lokasi: fd.get("lokasi"),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowForm(false);
        setSuccess(true);
        setTimeout(() => { setSuccess(false); window.location.reload(); }, 2000);
      } else {
        setError(data.error ?? "Gagal membuat tiket");
      }
    });
  }

  return (
    <div className="space-y-5 animate-fade-in">
      {success && (
        <div className="rounded-xl bg-green-50 border border-green-200 px-5 py-3 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-600" />
          <p className="text-sm font-medium text-green-800">Tiket berhasil dibuat dan dikirim ke admin!</p>
        </div>
      )}

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{tiket.length} tiket dibuat</p>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Buat Tiket Baru
        </button>
      </div>

      <div className="space-y-3">
        {tiket.length === 0 ? (
          <div className="bg-card rounded-xl border p-12 text-center text-muted-foreground">
            <Wrench className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">Belum ada tiket kerusakan</p>
          </div>
        ) : (
          tiket.map((t) => (
            <div key={t.id} className="bg-card rounded-xl border p-4 hover:shadow-sm transition-shadow">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <code className="text-xs bg-muted px-2 py-0.5 rounded font-mono">{t.nomorTiket}</code>
                    <span className={cn("badge-status", STATUS_INFO[t.status]?.color)}>
                      {STATUS_INFO[t.status]?.label ?? t.status}
                    </span>
                    <span className={cn(
                      "badge-status",
                      PRIORITAS_OPTIONS.find(p => p.value === t.prioritas)?.color ?? "bg-gray-100 text-gray-700"
                    )}>
                      {PRIORITAS_OPTIONS.find(p => p.value === t.prioritas)?.label ?? t.prioritas}
                    </span>
                  </div>
                  <p className="font-semibold text-sm text-foreground">{t.judul}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{t.deskripsi}</p>
                  {t.lokasi && (
                    <p className="text-xs text-muted-foreground mt-1">📍 {t.lokasi}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">{formatTanggal(t.createdAt)}</p>
                </div>
              </div>
              {t.catatanAdmin && (
                <div className="mt-3 text-xs text-blue-700 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
                  <span className="font-semibold">Catatan Admin:</span> {t.catatanAdmin}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-card rounded-2xl border shadow-2xl w-full max-w-md animate-fade-in">
            <div className="border-b px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-orange-500" />
                <h2 className="font-bold text-foreground">Buat Tiket Kerusakan</h2>
              </div>
              <button onClick={() => setShowForm(false)} className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Judul Masalah *</label>
                <input name="judul" required placeholder="Misal: AC ruang rapat bocor" className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Deskripsi Lengkap *</label>
                <textarea name="deskripsi" required rows={3} placeholder="Jelaskan kondisi kerusakan secara detail..." className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Prioritas *</label>
                  <select name="prioritas" defaultValue="NORMAL" className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background">
                    {PRIORITAS_OPTIONS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Lokasi</label>
                  <input name="lokasi" placeholder="Ruang / Lantai" className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background" />
                </div>
              </div>
              {error && <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 px-4 py-2.5 text-sm font-medium border rounded-lg hover:bg-muted">Batal</button>
                <button type="submit" disabled={isPending} className="flex-1 px-4 py-2.5 text-sm font-semibold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-60">
                  {isPending ? "Mengirim..." : "Kirim Tiket"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
