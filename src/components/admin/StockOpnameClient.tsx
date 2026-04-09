// src/components/admin/StockOpnameClient.tsx
"use client";

import { useState, useTransition } from "react";
import { ClipboardCheck, Save, CheckCircle2, AlertTriangle } from "lucide-react";
import { formatTanggal, generateNomorOpname, cn } from "@/lib/utils";
import type { Barang, StockOpname, DetailOpname } from "@prisma/client";

type OpnameWithDetail = StockOpname & { detailOpname: DetailOpname[] };

interface OpnameRow {
  barangId: string;
  nama: string;
  satuan: string;
  stokSistem: number;
  stokFisik: number;
  keterangan: string;
}

interface Props {
  barangList: Barang[];
  riwayatOpname: OpnameWithDetail[];
}

export function StockOpnameClient({ barangList, riwayatOpname }: Props) {
  const [activeTab, setActiveTab] = useState<"baru" | "riwayat">("baru");
  const [rows, setRows] = useState<OpnameRow[]>(
    barangList.map((b) => ({
      barangId: b.id,
      nama: b.nama,
      satuan: b.satuan,
      stokSistem: b.stokSaatIni,
      stokFisik: b.stokSaatIni,
      keterangan: "",
    }))
  );
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  function updateRow(idx: number, field: "stokFisik" | "keterangan", value: string | number) {
    setRows((prev) =>
      prev.map((r, i) => (i === idx ? { ...r, [field]: value } : r))
    );
  }

  const selisihRows = rows.filter((r) => r.stokFisik !== r.stokSistem);

  async function handleSave(status: "DRAFT" | "FINAL") {
    startTransition(async () => {
      const res = await fetch("/api/stock-opname", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nomorOpname: generateNomorOpname(),
          status,
          rows: rows.map((r) => ({
            barangId: r.barangId,
            stokSistem: r.stokSistem,
            stokFisik: r.stokFisik,
            selisih: r.stokFisik - r.stokSistem,
            keterangan: r.keterangan,
          })),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSaved(true);
        setTimeout(() => window.location.reload(), 1500);
      }
    });
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex gap-1 bg-muted p-1 rounded-xl w-fit">
        {[
          { key: "baru", label: "Lembar Opname Baru" },
          { key: "riwayat", label: "Riwayat Opname" },
        ].map((tab) => (
          <button key={tab.key}
            onClick={() => setActiveTab(tab.key as "baru" | "riwayat")}
            className={cn("px-4 py-2 rounded-lg text-sm font-medium transition-all",
              activeTab === tab.key ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"
            )}>
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "baru" && (
        <div className="space-y-4">
          {saved && (
            <div className="rounded-xl bg-green-50 border border-green-200 px-5 py-3 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <p className="text-sm font-medium text-green-800">Opname berhasil disimpan!</p>
            </div>
          )}

          {selisihRows.length > 0 && (
            <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-800 text-sm">Ditemukan {selisihRows.length} item dengan selisih</p>
                <p className="text-xs text-amber-700 mt-0.5">
                  {selisihRows.map((r) => `${r.nama} (${r.stokFisik - r.stokSistem > 0 ? "+" : ""}${r.stokFisik - r.stokSistem})`).join(", ")}
                </p>
              </div>
            </div>
          )}

          <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b bg-muted/30">
              <div className="flex items-center gap-2">
                <ClipboardCheck className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-semibold">Lembar Kertas Kerja Stock Opname</span>
                <span className="text-xs text-muted-foreground">— {new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" })}</span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleSave("DRAFT")} disabled={isPending}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border rounded-lg hover:bg-muted disabled:opacity-60">
                  <Save className="w-3.5 h-3.5" /> Simpan Draft
                </button>
                <button onClick={() => handleSave("FINAL")} disabled={isPending}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-60">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Finalisasi
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/20">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Nama Barang</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Stok Sistem</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Stok Fisik</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Selisih</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Keterangan</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {rows.map((row, idx) => {
                    const selisih = row.stokFisik - row.stokSistem;
                    return (
                      <tr key={row.barangId} className={cn("hover:bg-muted/10", selisih !== 0 && "bg-amber-50/50")}>
                        <td className="px-4 py-2.5 font-medium text-sm">{row.nama}
                          <span className="text-xs text-muted-foreground ml-1">/ {row.satuan}</span>
                        </td>
                        <td className="px-4 py-2.5 text-right font-semibold">{row.stokSistem}</td>
                        <td className="px-4 py-2.5 text-center">
                          <input
                            type="number"
                            min="0"
                            value={row.stokFisik}
                            onChange={(e) => updateRow(idx, "stokFisik", parseInt(e.target.value) || 0)}
                            className="w-20 text-center px-2 py-1 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background font-semibold"
                          />
                        </td>
                        <td className={cn("px-4 py-2.5 text-right font-bold",
                          selisih > 0 ? "text-green-600" : selisih < 0 ? "text-red-500" : "text-muted-foreground"
                        )}>
                          {selisih > 0 ? `+${selisih}` : selisih}
                        </td>
                        <td className="px-4 py-2.5">
                          <input
                            type="text"
                            value={row.keterangan}
                            onChange={(e) => updateRow(idx, "keterangan", e.target.value)}
                            placeholder="Keterangan selisih..."
                            className="w-full px-2 py-1 text-xs border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === "riwayat" && (
        <div className="space-y-3">
          {riwayatOpname.length === 0 ? (
            <div className="bg-card rounded-xl border p-12 text-center text-muted-foreground">
              <ClipboardCheck className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">Belum ada riwayat stock opname</p>
            </div>
          ) : (
            riwayatOpname.map((op) => (
              <div key={op.id} className="bg-card rounded-xl border p-4 hover:shadow-sm transition-shadow">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <code className="text-xs bg-muted px-2 py-0.5 rounded font-mono">{op.nomorOpname}</code>
                    <p className="text-sm font-medium text-foreground mt-1">{formatTanggal(op.tanggal)}</p>
                    <p className="text-xs text-muted-foreground">{op.detailOpname.length} item diperiksa ·
                      {" "}{op.detailOpname.filter(d => d.selisih !== 0).length} item ada selisih
                    </p>
                  </div>
                  <span className={cn("badge-status", op.status === "FINAL" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700")}>
                    {op.status}
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
