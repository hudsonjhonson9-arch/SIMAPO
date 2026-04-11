// src/components/pegawai/PeminjamanClient.tsx
"use client";

import { useState, useTransition } from "react";
import { CalendarDays, Clock, CheckCircle, Package, Send } from "lucide-react";
import { formatRupiah, formatTanggal, cn } from "@/lib/utils";
import { generateNomorPeminjaman } from "@/lib/utils";
import { db } from "@/lib/db";

// Types from Prisma
type AsetItem = {
  id: string;
  nomorInventaris: string | null;
  nomorSeri: string | null;
  kondisi: string;
  barang: {
    nama: string;
    satuan: string;
    hargaSatuan: unknown;
    kategori: { nama: string } | null;
  };
};

type RiwayatItem = {
  id: string;
  nomorPeminjaman: string;
  status: string;
  tujuanPeminjaman: string;
  tanggalMulai: Date;
  tanggalSelesai: Date;
  unitAset: { barang: { nama: string } };
};

interface Props {
  asetTersedia: AsetItem[];
  riwayat: RiwayatItem[];
}

export function PeminjamanClient({ asetTersedia, riwayat }: Props) {
  const [selected, setSelected] = useState<AsetItem | null>(null);
  const [activeTab, setActiveTab] = useState<"katalog" | "riwayat">("katalog");
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const fd = new FormData(e.currentTarget);
    const tujuan = fd.get("tujuan") as string;
    const mulai = fd.get("tanggalMulai") as string;
    const selesai = fd.get("tanggalSelesai") as string;

    if (!selected || !tujuan || !mulai || !selesai) {
      setError("Semua field wajib diisi");
      return;
    }
    if (new Date(selesai) <= new Date(mulai)) {
      setError("Tanggal selesai harus setelah tanggal mulai");
      return;
    }

    startTransition(async () => {
      const res = await fetch("/api/peminjaman", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          unitAsetId: selected.id,
          tujuanPeminjaman: tujuan,
          tanggalMulai: mulai,
          tanggalSelesai: selesai,
          nomorPeminjaman: generateNomorPeminjaman(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSelected(null);
        setSuccess(true);
        setTimeout(() => { setSuccess(false); window.location.reload(); }, 2000);
      } else {
        setError(data.error ?? "Gagal mengajukan peminjaman");
      }
    });
  }

  const kondisiColor: Record<string, string> = {
    BAIK: "bg-green-100 text-green-700",
    RUSAK_RINGAN: "bg-amber-100 text-amber-700",
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {success && (
        <div className="rounded-xl bg-green-50 border border-green-200 px-5 py-3 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <p className="text-sm font-medium text-green-800">Permintaan peminjaman berhasil diajukan!</p>
        </div>
      )}

      <div className="flex gap-1 bg-muted p-1 rounded-xl w-fit">
        {[
          { key: "katalog", label: "Katalog Aset" },
          { key: "riwayat", label: "Riwayat Peminjaman" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as "katalog" | "riwayat")}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-all",
              activeTab === tab.key ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "katalog" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {asetTersedia.length === 0 ? (
                <div className="col-span-2 bg-card rounded-xl border p-10 text-center text-muted-foreground">
                  <Package className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Tidak ada aset tersedia saat ini</p>
                </div>
              ) : (
                asetTersedia.map((aset) => (
                  <div
                    key={aset.id}
                    onClick={() => setSelected(aset)}
                    className={cn(
                      "bg-card rounded-xl border p-4 cursor-pointer transition-all hover:shadow-sm",
                      selected?.id === aset.id && "border-primary/60 shadow-sm shadow-primary/10"
                    )}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Package className="w-5 h-5 text-primary" />
                      </div>
                      <span className={cn("badge-status", kondisiColor[aset.kondisi] ?? "bg-gray-100 text-gray-700")}>
                        {aset.kondisi === "BAIK" ? "Baik" : "Rusak Ringan"}
                      </span>
                    </div>
                    <p className="font-semibold text-sm text-foreground">{aset.barang.nama}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{aset.barang.kategori?.nama}</p>
                    <div className="mt-3 pt-3 border-t flex justify-between text-xs text-muted-foreground">
                      <span>No. Inv: {aset.nomorInventaris ?? "-"}</span>
                      <span className="font-medium text-foreground">{formatRupiah(Number(aset.barang.hargaSatuan))}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-card rounded-xl border shadow-sm sticky top-6">
              <div className="flex items-center gap-2 px-5 py-4 border-b">
                <CalendarDays className="w-4 h-4 text-primary" />
                <h3 className="font-semibold text-sm">Form Peminjaman</h3>
              </div>
              <div className="p-4">
                {!selected ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Package className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="text-xs">Pilih aset dari katalog</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-3">
                    <div className="bg-primary/5 rounded-xl p-3 border border-primary/20">
                      <p className="text-xs font-semibold text-primary">Aset Dipilih:</p>
                      <p className="text-sm font-bold text-foreground mt-0.5">{selected.barang.nama}</p>
                      <p className="text-xs text-muted-foreground">{selected.nomorInventaris}</p>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Tujuan Peminjaman *</label>
                      <textarea
                        name="tujuan"
                        placeholder="Misal: Rapat koordinasi di Kabupaten Sumba Barat..."
                        rows={2}
                        required
                        className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Tgl Mulai *</label>
                        <input
                          name="tanggalMulai"
                          type="date"
                          required
                          min={new Date().toISOString().split("T")[0]}
                          className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Tgl Selesai *</label>
                        <input
                          name="tanggalSelesai"
                          type="date"
                          required
                          min={new Date().toISOString().split("T")[0]}
                          className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background"
                        />
                      </div>
                    </div>

                    {error && (
                      <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
                    )}

                    <div className="flex gap-2 pt-1">
                      <button type="button" onClick={() => setSelected(null)} className="flex-1 px-3 py-2.5 text-xs font-medium border rounded-lg hover:bg-muted">Batal</button>
                      <button type="submit" disabled={isPending} className="flex-1 px-3 py-2.5 text-xs font-semibold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-60 flex items-center justify-center gap-1.5">
                        <Send className="w-3.5 h-3.5" />
                        {isPending ? "Mengajukan..." : "Ajukan"}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "riwayat" && (
        <div className="space-y-3">
          {riwayat.length === 0 ? (
            <div className="bg-card rounded-xl border p-12 text-center text-muted-foreground">
              <Clock className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">Belum ada riwayat peminjaman</p>
            </div>
          ) : (
            riwayat.map((p) => (
              <div key={p.id} className="bg-card rounded-xl border p-4 hover:shadow-sm transition-shadow">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <code className="text-xs bg-muted px-2 py-0.5 rounded font-mono">{p.nomorPeminjaman}</code>
                    <p className="font-semibold text-sm text-foreground mt-1">{p.unitAset.barang.nama}</p>
                    <p className="text-xs text-muted-foreground">{p.tujuanPeminjaman}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatTanggal(p.tanggalMulai)} — {formatTanggal(p.tanggalSelesai)}
                    </p>
                  </div>
                  <span className={cn(
                    "badge-status",
                    p.status === "MENUNGGU"      ? "bg-amber-100 text-amber-700" :
                    p.status === "DIPINJAM"      ? "bg-blue-100 text-blue-700"   :
                    p.status === "DIKEMBALIKAN"  ? "bg-green-100 text-green-700" :
                    p.status === "DIBATALKAN"    ? "bg-gray-100 text-gray-700"   :
                    "bg-purple-100 text-purple-700"
                  )}>
                    {p.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
