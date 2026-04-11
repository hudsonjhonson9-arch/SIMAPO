// src/components/admin/BarangMasukClient.tsx
"use client";

import { useState, useTransition } from "react";
import { 
  PackagePlus, Clock, Search, FileText, 
  Store, Calendar, Hash, Tag, Layers, ChevronDown 
} from "lucide-react";
import { addBarangMasuk } from "@/actions/barang-masuk.actions";
import { formatRupiah, formatTanggal, cn } from "@/lib/utils";
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
  const [showFullForm, setShowFullForm] = useState(false);

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
        setError(typeof result.error === "string" ? result.error : "Terdapat kesalahan data");
      }
    });
  }

  const totalMasukBulanIni = history.filter((h) => {
    const now = new Date();
    const d = new Date(h.tanggal);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  return (
    <div className="space-y-6 animate-fade-in pb-20 lg:pb-0">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Container */}
        <div className="lg:col-span-1">
          <div className="bg-card rounded-2xl border shadow-sm overflow-hidden sticky top-6">
            <div className="bg-green-500/5 px-5 py-4 border-b flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <PackagePlus className="w-4 h-4 text-green-600" />
                </div>
                <h3 className="font-bold text-sm tracking-tight text-foreground">Catat Barang Masuk</h3>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {/* Basic Info Section */}
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                    <Tag className="w-3 h-3" /> Barang *
                  </label>
                  <select
                    name="barangId"
                    required
                    className="w-full px-3 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 bg-background transition-all"
                  >
                    <option value="">— Pilih Barang SIPD —</option>
                    {barangList.map((b) => (
                      <option key={b.id} value={b.id}>
                        [{b.kodeBarang}] {b.nama}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Jumlah *</label>
                    <input
                      name="jumlah"
                      type="number"
                      min="1"
                      required
                      placeholder="0"
                      className="w-full px-3 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 bg-background"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Harga Satuan</label>
                    <input
                      name="hargaSatuan"
                      type="number"
                      min="0"
                      placeholder="Rp 0"
                      className="w-full px-3 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 bg-background"
                    />
                  </div>
                </div>
              </div>

              {/* Toggle Procurement Details */}
              <button 
                type="button"
                onClick={() => setShowFullForm(!showFullForm)}
                className="w-full py-2 px-3 border border-dashed rounded-xl text-[10px] font-bold text-muted-foreground uppercase tracking-widest hover:bg-muted/50 transition-colors flex items-center justify-center gap-2"
              >
                {showFullForm ? "Sembunyikan Detail Pengadaan" : "Lengkapi Detail Pengadaan (SIPD)"}
                <ChevronDown className={cn("w-3 h-3 transition-transform", showFullForm && "rotate-180")} />
              </button>

              {/* Procurement Meta Section */}
              {showFullForm && (
                <div className="space-y-3 pt-2 animate-in slide-in-from-top-2 duration-300">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                      <Store className="w-3 h-3" /> Penyedia / Vendor
                    </label>
                    <input
                      name="penyedia"
                      placeholder="Nama Toko / Perusahaan"
                      className="w-full px-3 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 bg-background"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Tgl Kwitansi</label>
                      <input name="tanggalKwitansi" type="date" className="w-full px-3 py-2.5 text-sm border rounded-xl focus:outline-none bg-background" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">No. BKU</label>
                      <input name="noBKU" placeholder="Nomor BKU" className="w-full px-3 py-2.5 text-sm border rounded-xl focus:outline-none bg-background" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">No. Berita Acara (BAST)</label>
                    <input name="noBeritaAcara" placeholder="Nomor Berita Acara" className="w-full px-3 py-2.5 text-sm border rounded-xl focus:outline-none bg-background" />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                      <Layers className="w-3 h-3" /> Kode Sub Kegiatan
                    </label>
                    <input name="kodeSubKegiatan" placeholder="1.01.02.1.01.01..." className="w-full px-3 py-2.5 text-sm border rounded-xl focus:outline-none bg-background" />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                      <Hash className="w-3 h-3" /> Kode Belanja
                    </label>
                    <input name="kodeBelanja" placeholder="5.1.02.01.01.0001..." className="w-full px-3 py-2.5 text-sm border rounded-xl focus:outline-none bg-background" />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                  <Calendar className="w-3 h-3" /> Tanggal Penerimaan
                </label>
                <input
                  name="tanggal"
                  type="date"
                  defaultValue={new Date().toISOString().split("T")[0]}
                  className="w-full px-3 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 bg-background"
                />
              </div>

              {error && (
                <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-xs text-red-700 animate-shake">
                  {JSON.stringify(error)}
                </div>
              )}
              {success && (
                <div className="rounded-xl bg-green-50 border border-green-200 p-3 text-xs text-green-700">
                  ✓ Berhasil mencatat mutasi masuk
                </div>
              )}

              <button
                type="submit"
                disabled={isPending}
                className="w-full py-3.5 text-sm font-bold bg-green-600 text-white rounded-xl hover:bg-green-700 active:scale-[0.98] transition-all disabled:opacity-60 shadow-lg shadow-green-600/20"
              >
                {isPending ? "Memproses..." : "Simpan Mutasi Masuk"}
              </button>
            </form>
          </div>
        </div>

        {/* History Section */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <h3 className="font-bold text-sm tracking-tight">Riwayat Penerimaan</h3>
            </div>
            <span className="text-[10px] font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-100">
              {totalMasukBulanIni} TRANSAKSI BULAN INI
            </span>
          </div>

          <div className="bg-card rounded-2xl border shadow-sm overflow-hidden">
            <div className="overflow-x-auto scrollbar-hide">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="text-left px-5 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Detail Barang</th>
                    <th className="text-right px-5 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Qty</th>
                    <th className="text-right px-5 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Total Nilai</th>
                    <th className="text-left px-5 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Info Pengadaan</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {history.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center py-20 text-muted-foreground">
                        <PackagePlus className="w-12 h-12 mx-auto mb-3 opacity-10" />
                        <p className="text-xs font-medium">Belum ada riwayat masuk</p>
                      </td>
                    </tr>
                  ) : (
                    history.map((h) => (
                      <tr key={h.id} className="hover:bg-muted/30 transition-colors group">
                        <td className="px-5 py-4">
                          <div className="flex flex-col">
                            <span className="font-bold text-foreground text-xs">{h.barangMasuk?.nama ?? "-"}</span>
                            <span className="text-[10px] text-muted-foreground font-mono mt-0.5">{h.barangMasuk?.kodeBarang}</span>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-[9px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground whitespace-nowrap">
                                {formatTanggal(h.tanggal)}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <span className="font-bold text-green-600 text-sm">+{h.jumlah}</span>
                          <span className="text-[10px] text-muted-foreground block">{h.barangMasuk?.satuan}</span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <span className="font-bold text-foreground text-xs">{formatRupiah(Number(h.hargaSatuan) * h.jumlah)}</span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="space-y-1">
                            <p className="text-[10px] text-muted-foreground truncate max-w-[150px]">
                              <span className="font-bold text-foreground/70">Penyedia:</span> {h.penyedia || "-"}
                            </p>
                            <p className="text-[10px] text-muted-foreground truncate max-w-[150px]">
                              <span className="font-bold text-foreground/70">BAST:</span> {h.noBeritaAcara || "-"}
                            </p>
                            {(h.kodeSubKegiatan) && (
                              <p className="text-[9px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded inline-block">
                                {h.kodeSubKegiatan}
                              </p>
                            )}
                          </div>
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
