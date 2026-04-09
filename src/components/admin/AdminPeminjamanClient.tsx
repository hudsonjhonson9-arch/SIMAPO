// src/components/admin/AdminPeminjamanClient.tsx
"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, XCircle, RotateCcw, Handshake } from "lucide-react";
import { formatTanggal, cn } from "@/lib/utils";

type PeminjamanItem = {
  id: string;
  nomorPeminjaman: string;
  status: string;
  tujuanPeminjaman: string;
  tanggalMulai: Date;
  tanggalSelesai: Date;
  kondisiAwal: string | null;
  kondisiKembali: string | null;
  user: { name: string; nip: string | null };
  unitAset: { barang: { nama: string } };
};

interface Props {
  peminjaman: PeminjamanItem[];
}

const STATUS_COLOR: Record<string, string> = {
  MENUNGGU:     "bg-amber-100 text-amber-700",
  DISETUJUI:    "bg-blue-100 text-blue-700",
  DIPINJAM:     "bg-purple-100 text-purple-700",
  DIKEMBALIKAN: "bg-green-100 text-green-700",
  DIBATALKAN:   "bg-gray-100 text-gray-700",
};

export function AdminPeminjamanClient({ peminjaman }: Props) {
  const [activeTab, setActiveTab] = useState<"aktif" | "selesai">("aktif");
  const [isPending, startTransition] = useTransition();

  async function updateStatus(id: string, status: string, extra?: Record<string, string>) {
    startTransition(async () => {
      await fetch("/api/peminjaman/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status, ...extra }),
      });
      window.location.reload();
    });
  }

  const aktif = peminjaman.filter((p) => ["MENUNGGU", "DISETUJUI", "DIPINJAM"].includes(p.status));
  const selesai = peminjaman.filter((p) => ["DIKEMBALIKAN", "DIBATALKAN"].includes(p.status));
  const list = activeTab === "aktif" ? aktif : selesai;

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex gap-1 bg-muted p-1 rounded-xl w-fit">
        {[
          { key: "aktif",  label: "Aktif",  count: aktif.length  },
          { key: "selesai",label: "Selesai",count: selesai.length },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as "aktif" | "selesai")}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
              activeTab === tab.key ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"
            )}
          >
            {tab.label}
            <span className="text-xs bg-muted-foreground/20 rounded-full px-1.5 py-0.5">{tab.count}</span>
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {list.length === 0 ? (
          <div className="bg-card rounded-xl border p-12 text-center text-muted-foreground">
            <Handshake className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">Tidak ada data peminjaman</p>
          </div>
        ) : (
          list.map((p) => (
            <div key={p.id} className="bg-card rounded-xl border p-4 hover:shadow-sm transition-shadow">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <code className="text-xs bg-muted px-2 py-0.5 rounded font-mono">{p.nomorPeminjaman}</code>
                    <span className={cn("badge-status", STATUS_COLOR[p.status])}>{p.status}</span>
                  </div>
                  <p className="font-semibold text-sm text-foreground">{p.unitAset.barang.nama}</p>
                  <p className="text-xs text-muted-foreground">
                    {p.user.name} · {formatTanggal(p.tanggalMulai)} — {formatTanggal(p.tanggalSelesai)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5 italic">{p.tujuanPeminjaman}</p>
                </div>

                <div className="flex gap-2 flex-shrink-0">
                  {p.status === "MENUNGGU" && (
                    <>
                      <button
                        onClick={() => updateStatus(p.id, "DISETUJUI")}
                        disabled={isPending}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-60"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Setujui
                      </button>
                      <button
                        onClick={() => updateStatus(p.id, "DIBATALKAN")}
                        disabled={isPending}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 disabled:opacity-60"
                      >
                        <XCircle className="w-3.5 h-3.5" /> Tolak
                      </button>
                    </>
                  )}
                  {p.status === "DISETUJUI" && (
                    <button
                      onClick={() => updateStatus(p.id, "DIPINJAM", { kondisiAwal: "Baik — Diserahkan oleh Admin" })}
                      disabled={isPending}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-60"
                    >
                      <Handshake className="w-3.5 h-3.5" /> Serah Terima
                    </button>
                  )}
                  {p.status === "DIPINJAM" && (
                    <button
                      onClick={() => updateStatus(p.id, "DIKEMBALIKAN", { kondisiKembali: "Baik — Dikembalikan" })}
                      disabled={isPending}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-60"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Terima Kembali
                    </button>
                  )}
                </div>
              </div>
              {p.kondisiAwal && (
                <p className="mt-2 text-xs text-muted-foreground bg-muted rounded-lg px-3 py-1.5">
                  <span className="font-semibold">Kondisi Awal:</span> {p.kondisiAwal}
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
