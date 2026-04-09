// src/components/admin/BarangMasukClient.tsx
"use client";

import { useState, useTransition } from "react";
import { PackagePlus, Clock, TrendingUp } from "lucide-react";
import { addBarangMasuk } from "@/actions/barang-masuk.actions";
import { formatRupiah, formatTanggal } from "@/lib/utils";
import type { Barang, MutasiBarang, User } from "@prisma/client";

type HistoryItem = MutasiBarang & {
  barangMasuk: Pick<Barang, "nama" | "satuan" | "kodeBarang"> | null;
  createdBy: Pick<User, "name"> | null;
};

interface Props {
  history: HistoryItem[];
  barangList: Barang[];
}

export function BarangMasukClient({ history, barangList }: Props) {
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess(false);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await addBarangMasuk(formData);
      if (result.success) {
        setSuccess(true);
        (e.target as HTMLFormElement).reset();
        setTimeout(() => window.location.reload(), 800);
      } else {
        setError(typeof result.error === "string" ? result.error : "Terdapat kesalahan");
      }
    });
  }

  const totalMasukBulanIni = history.filter((h) => {
    const now = new Date();
    const d = new Date(h.tanggal);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-1">
          <div className="bg-card rounded-xl border shadow-sm p-5 sticky top-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                <PackagePlus className="w-4 h-4 text-green-600" />
              </div>
              <h3 className="font-semibold text-sm">Catat Barang Masuk</h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Barang *</label>
                <select
                  name="barangId"
                  required
                  className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-background"
                >
                  <option value="">— Pilih Barang —</option>
                  {barangList.map((b) => (
                    <option key={b.id} value={b.id}>
                      [{b.kodeBarang}] {b.nama} (stok: {b.stokSaatIni} {b.satuan})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Jumlah *</label>
                  <input
                    name="jumlah"
                    type="number"
                    min="1"
                    required
                    placeholder="0"
                    className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-background"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Harga Satuan</label>
                  <input
                    name="hargaSatuan"
                    type="number"
                    min="0"
                    placeholder="0"
                    className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-background"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Tanggal Penerimaan</label>
                <input
                  name="tanggal"
                  type="date"
                  defaultValue={new Date().toISOString().split("T")[0]}
                  className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-background"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Keterangan</label>
                <input
                  name="keterangan"
                  placeholder="Misal: Pembelian dari toko X, No. BAST 001/2025"
                  className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-background"
                />
              </div>

              {error && (
                <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">{error}</div>
              )}
              {success && (
                <div className="rounded-lg bg-green-50 border border-green-200 px-3 py-2 text-xs text-green-700">
                  ✓ Barang masuk berhasil dicatat
                </div>
              )}

              <button
                type="submit"
                disabled={isPending}
                className="w-full py-2.5 text-sm font-semibold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-60 mt-1"
              >
                {isPending ? "Menyimpan..." : "Catat Barang Masuk"}
              </button>
            </form>
          </div>
        </div>

        {/* History */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <h3 className="font-semibold text-sm">Riwayat Penerimaan</h3>
            </div>
            <span className="text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
              {totalMasukBulanIni} transaksi bulan ini
            </span>
          </div>

          <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Tanggal</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Barang</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Jumlah</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Nilai</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Keterangan</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {history.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-10 text-muted-foreground text-sm">
                        Belum ada riwayat penerimaan barang
                      </td>
                    </tr>
                  ) : (
                    history.map((h) => (
                      <tr key={h.id} className="hover:bg-muted/20 transition-colors">
                        <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                          {formatTanggal(h.tanggal)}
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-medium text-xs">{h.barangMasuk?.nama ?? "-"}</p>
                          <p className="text-[10px] text-muted-foreground">{h.barangMasuk?.kodeBarang}</p>
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-green-600">
                          +{h.jumlah} {h.barangMasuk?.satuan}
                        </td>
                        <td className="px-4 py-3 text-right text-xs font-medium">
                          {formatRupiah(Number(h.hargaSatuan) * h.jumlah)}
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground max-w-[200px] truncate">
                          {h.keterangan ?? "-"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
