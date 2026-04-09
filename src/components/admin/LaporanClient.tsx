// src/components/admin/LaporanClient.tsx
"use client";

import { useState } from "react";
import { FileText, Download, Filter } from "lucide-react";
import { formatRupiah, formatTanggal, formatTanggalPendek, cn } from "@/lib/utils";
import type { Barang, MutasiBarang, User } from "@prisma/client";

type MutasiItem = MutasiBarang & {
  barangMasuk:  Pick<Barang, "nama" | "satuan" | "kodeBarang"> | null;
  barangKeluar: Pick<Barang, "nama" | "satuan" | "kodeBarang"> | null;
  createdBy:    Pick<User, "name"> | null;
};

interface Props {
  mutasi: MutasiItem[];
  barangList: Barang[];
}

type LaporanType = "penerimaan" | "pengeluaran" | "persediaan";

export function LaporanClient({ mutasi, barangList }: Props) {
  const [activeType, setActiveType] = useState<LaporanType>("penerimaan");
  const [filterBarang, setFilterBarang] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const filtered = mutasi.filter((m) => {
    const typeMatch =
      activeType === "penerimaan" ? m.referensiType === "PENERIMAAN" :
      activeType === "pengeluaran" ? m.referensiType === "REQUEST" :
      true;
    const barangMatch = !filterBarang ||
      m.barangMasuk?.kodeBarang === filterBarang ||
      m.barangKeluar?.kodeBarang === filterBarang;
    const dateMatch =
      (!dateFrom || new Date(m.tanggal) >= new Date(dateFrom)) &&
      (!dateTo   || new Date(m.tanggal) <= new Date(dateTo + "T23:59:59"));
    return typeMatch && barangMatch && dateMatch;
  });

  function exportCSV() {
    const headers = ["Tanggal", "No. Referensi", "Nama Barang", "Kode", "Jenis", "Jumlah", "Satuan", "Harga Satuan", "Total Nilai", "Keterangan"];
    const rows = filtered.map((m) => {
      const barang = m.barangMasuk ?? m.barangKeluar;
      const jenis = m.referensiType === "PENERIMAAN" ? "MASUK" : "KELUAR";
      return [
        formatTanggalPendek(m.tanggal),
        m.referensiId ?? "-",
        barang?.nama ?? "-",
        barang?.kodeBarang ?? "-",
        jenis,
        m.jumlah,
        barang?.satuan ?? "-",
        Number(m.hargaSatuan),
        Number(m.hargaSatuan) * m.jumlah,
        m.keterangan ?? "-",
      ];
    });
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `SIMAPO_${activeType}_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Hitung persediaan per barang
  const persediaan = barangList.map((b) => {
    const masuk = mutasi.filter((m) => m.barangMasukId === b.id).reduce((s, m) => s + m.jumlah, 0);
    const keluar = mutasi.filter((m) => m.barangKeluarId === b.id).reduce((s, m) => s + m.jumlah, 0);
    return { ...b, totalMasuk: masuk, totalKeluar: keluar };
  });

  const TABS: { key: LaporanType; label: string }[] = [
    { key: "penerimaan",  label: "Buku Penerimaan"   },
    { key: "pengeluaran", label: "Buku Pengeluaran"  },
    { key: "persediaan",  label: "Kartu Persediaan"  },
  ];

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Report type tabs */}
      <div className="flex gap-1 bg-muted p-1 rounded-xl w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveType(tab.key)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-all",
              activeType === tab.key ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filters */}
      {activeType !== "persediaan" && (
        <div className="bg-card rounded-xl border p-4 flex flex-wrap gap-3 items-end">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Barang</label>
            <select value={filterBarang} onChange={(e) => setFilterBarang(e.target.value)}
              className="px-3 py-2 text-sm border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 min-w-[200px]">
              <option value="">Semua Barang</option>
              {barangList.map((b) => <option key={b.kodeBarang} value={b.kodeBarang}>[{b.kodeBarang}] {b.nama}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Dari Tanggal</label>
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
              className="px-3 py-2 text-sm border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Sampai Tanggal</label>
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
              className="px-3 py-2 text-sm border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
          <button onClick={exportCSV}
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 text-white text-sm font-semibold rounded-lg hover:bg-green-600 transition-colors ml-auto">
            <Download className="w-4 h-4" />
            Export SIPD-Ready (.csv)
          </button>
        </div>
      )}

      {/* Table */}
      <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b bg-muted/30">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-semibold">
              {TABS.find(t => t.key === activeType)?.label}
            </span>
            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
              {activeType === "persediaan" ? persediaan.length : filtered.length} baris
            </span>
          </div>
        </div>
        <div className="overflow-x-auto">
          {activeType === "persediaan" ? (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  {["Kode Barang", "Kode Rekening", "Nama Barang", "Satuan", "Stok Saat Ini", "Total Masuk", "Total Keluar", "Harga Satuan", "Total Nilai"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {persediaan.map((b) => (
                  <tr key={b.id} className="hover:bg-muted/20">
                    <td className="px-4 py-3"><code className="text-xs bg-muted px-1.5 py-0.5 rounded">{b.kodeBarang}</code></td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{b.kodeRekening ?? "-"}</td>
                    <td className="px-4 py-3 font-medium">{b.nama}</td>
                    <td className="px-4 py-3 text-muted-foreground">{b.satuan}</td>
                    <td className="px-4 py-3 font-semibold text-right">{b.stokSaatIni}</td>
                    <td className="px-4 py-3 text-right text-green-600 font-medium">+{b.totalMasuk}</td>
                    <td className="px-4 py-3 text-right text-red-500 font-medium">-{b.totalKeluar}</td>
                    <td className="px-4 py-3 text-right">{formatRupiah(Number(b.hargaSatuan))}</td>
                    <td className="px-4 py-3 text-right font-bold">{formatRupiah(Number(b.hargaSatuan) * b.stokSaatIni)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  {["Tanggal", "Nama Barang", "Kode", activeType === "penerimaan" ? "Jumlah Masuk" : "Jumlah Keluar", "Harga Satuan", "Total Nilai", "Keterangan"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-10 text-muted-foreground text-sm">Tidak ada data</td></tr>
                ) : (
                  filtered.map((m) => {
                    const barang = m.barangMasuk ?? m.barangKeluar;
                    const total = Number(m.hargaSatuan) * m.jumlah;
                    return (
                      <tr key={m.id} className="hover:bg-muted/20">
                        <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{formatTanggal(m.tanggal)}</td>
                        <td className="px-4 py-3 font-medium">{barang?.nama ?? "-"}</td>
                        <td className="px-4 py-3"><code className="text-xs bg-muted px-1.5 py-0.5 rounded">{barang?.kodeBarang ?? "-"}</code></td>
                        <td className={cn("px-4 py-3 font-bold text-right", activeType === "penerimaan" ? "text-green-600" : "text-red-500")}>
                          {activeType === "penerimaan" ? "+" : "-"}{m.jumlah} {barang?.satuan}
                        </td>
                        <td className="px-4 py-3 text-right">{formatRupiah(Number(m.hargaSatuan))}</td>
                        <td className="px-4 py-3 text-right font-semibold">{formatRupiah(total)}</td>
                        <td className="px-4 py-3 text-xs text-muted-foreground max-w-[200px] truncate">{m.keterangan ?? "-"}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
