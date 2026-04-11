// src/components/admin/PemeliharaanClient.tsx
"use client";

import { useState } from "react";
import { 
  Wrench, Printer, Search, Calendar, 
  ChevronRight, Plus, ExternalLink, 
  Package, DollarSign, User as UserIcon,
  TrendingDown, Layers, History
} from "lucide-react";
import { formatRupiah, formatTanggal, cn } from "@/lib/utils";
import type { UnitAset, Barang, RiwayatPemeliharaan, DetailPemeliharaan } from "@prisma/client";

type UnitWithHistory = UnitAset & {
  barang: Barang;
  pemeliharaan: (RiwayatPemeliharaan & {
    detailPemeliharaan: DetailPemeliharaan[];
  })[];
};

interface Props {
  units: UnitWithHistory[];
}

export function PemeliharaanClient({ units }: Props) {
  const [searchTerm, setSearchTerm] = useState("");
  const [subKegiatanFilter, setSubKegiatanFilter] = useState("ALL");
  const [selectedUnit, setSelectedUnit] = useState<UnitWithHistory | null>(null);

  // Get unique sub-activities
  const subKegiatans = Array.from(new Set(units.map(u => u.kodeSubKegiatan).filter(Boolean)));

  const filtered = units.filter(u => {
    const matchesSearch = u.barang.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         u.nomorInventaris?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = subKegiatanFilter === "ALL" || u.kodeSubKegiatan === subKegiatanFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6 animate-fade-in pb-20 lg:pb-0">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Asset List & Filters */}
        <div className="lg:col-span-12 xl:col-span-12 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  placeholder="Cari Nama Aset / No. Inventaris..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm border rounded-xl bg-card focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <select
                value={subKegiatanFilter}
                onChange={(e) => setSubKegiatanFilter(e.target.value)}
                className="px-3 py-2 text-sm border rounded-xl bg-card focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="ALL">Semua Sub Kegiatan</option>
                {subKegiatans.map(sk => (
                  <option key={sk} value={sk!}>{sk}</option>
                ))}
              </select>
            </div>
            
            <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-bold rounded-xl hover:shadow-lg hover:shadow-primary/20 transition-all active:scale-95">
              <Plus className="w-4 h-4" /> Catat Pemeliharaan Baru
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map(unit => {
              const totalCost = unit.pemeliharaan.reduce((sum, h) => sum + Number(h.biayaTotal), 0);
              const lastService = unit.pemeliharaan[0];

              return (
                <div 
                  key={unit.id}
                  onClick={() => setSelectedUnit(unit)}
                  className={cn(
                    "group bg-card border rounded-2xl p-5 cursor-pointer transition-all hover:border-primary/50 hover:shadow-xl",
                    selectedUnit?.id === unit.id && "border-primary ring-1 ring-primary/20 shadow-xl"
                  )}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-3 rounded-2xl bg-primary/5 group-hover:bg-primary/10 transition-colors">
                      <Wrench className="w-5 h-5 text-primary" />
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase opacity-50 tracking-tighter">TOTAL BIAYA</span>
                      <p className="text-sm font-black text-foreground">{formatRupiah(totalCost)}</p>
                    </div>
                  </div>

                  <h3 className="font-bold text-sm tracking-tight mb-1 group-hover:text-primary transition-colors">{unit.barang.nama}</h3>
                  <p className="text-[10px] font-mono text-muted-foreground mb-4">{unit.nomorInventaris || "Tidak ada No. Inv"}</p>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-muted-foreground font-bold uppercase tracking-widest">Sub Kegiatan</span>
                      <span className="bg-muted px-2 py-0.5 rounded font-bold text-foreground/70">{unit.kodeSubKegiatan || "-"}</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-muted-foreground font-bold uppercase tracking-widest">Servis Terakhir</span>
                      <span className="font-bold">{lastService ? formatTanggal(lastService.tanggal) : "Belum pernah"}</span>
                    </div>
                  </div>

                  {lastService && (
                    <div className="mt-4 pt-4 border-t border-dashed">
                      <p className="text-[10px] text-muted-foreground line-clamp-2 italic">
                        "{lastService.kegiatan}"
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal-like Sidebar for Detail (Mobile full overlay) */}
        {selectedUnit && (
          <div className="fixed inset-0 z-[110] lg:flex lg:items-center lg:justify-center">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedUnit(null)} />
            
            {/* Sheet/Card */}
            <div className="absolute bottom-0 left-0 right-0 top-12 lg:relative lg:top-0 lg:w-[800px] lg:h-[80vh] bg-background rounded-t-[2.5rem] lg:rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-500">
              {/* Header */}
              <div className="p-8 border-b flex items-center justify-between bg-card/50">
                <div className="flex items-center gap-4">
                  <div className="p-4 rounded-3xl bg-primary/10">
                    <History className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black tracking-tight">KARTU PEMELIHARAAN</h2>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-[0.2em]">{selectedUnit.barang.nama}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedUnit(null)}
                  className="w-10 h-10 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground transition-all"
                >
                  ✕
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                {/* Stats Summary */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { label: "Total Servis", value: selectedUnit.pemeliharaan.length, icon: Wrench, color: "text-blue-500" },
                    { label: "Total Biaya", value: formatRupiah(selectedUnit.pemeliharaan.reduce((s, h) => s + Number(h.biayaTotal), 0)), icon: DollarSign, color: "text-green-500" },
                    { label: "Tahun", value: selectedUnit.tahunPerolehan || "-", icon: Calendar, color: "text-amber-500" },
                    { label: "Sub Kegiatan", value: selectedUnit.kodeSubKegiatan || "-", icon: Layers, color: "text-purple-500" },
                  ].map((stat, i) => (
                    <div key={i} className="bg-card border rounded-2xl p-4 flex flex-col items-center text-center">
                      <div className={cn("p-2 rounded-xl bg-muted/50 mb-2", stat.color)}>
                        <stat.icon className="w-4 h-4" />
                      </div>
                      <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">{stat.label}</span>
                      <p className="text-xs font-black mt-1 text-foreground">{stat.value}</p>
                    </div>
                  ))}
                </div>

                {/* Timeline History */}
                <div className="space-y-6">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground/70">Riwayat Servis & Penggantian Suku Cadang</h3>
                  
                  {selectedUnit.pemeliharaan.length === 0 ? (
                    <div className="text-center py-20 bg-muted/20 rounded-3xl border border-dashed">
                      <Wrench className="w-12 h-12 mx-auto mb-3 opacity-10" />
                      <p className="text-xs text-muted-foreground font-medium">Belum ada riwayat pemeliharaan tercatat</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {selectedUnit.pemeliharaan.map((log, idx) => (
                        <div key={log.id} className="relative bg-card border rounded-3xl p-6 hover:shadow-md transition-shadow">
                          {/* Left date indicator */}
                          <div className="flex flex-col sm:flex-row gap-6">
                            <div className="sm:w-32 flex-shrink-0">
                              <p className="font-black text-xl text-primary">{new Date(log.tanggal).getDate()}</p>
                              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                {new Date(log.tanggal).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })}
                              </p>
                            </div>

                            <div className="flex-1 space-y-4">
                              <div>
                                <h4 className="font-bold text-sm text-foreground">{log.kegiatan}</h4>
                                <div className="flex items-center gap-3 mt-1">
                                  <span className="flex items-center gap-1 text-[10px] text-muted-foreground font-medium">
                                    <UserIcon className="w-3 h-3" /> {log.petugas || "Internal"}
                                  </span>
                                  <span className="w-1 h-1 rounded-full bg-muted" />
                                  <span className="text-[10px] font-black text-green-600">
                                    {formatRupiah(Number(log.biayaTotal))}
                                  </span>
                                </div>
                              </div>

                              {log.catatan && (
                                <p className="text-xs text-muted-foreground italic leading-relaxed">
                                  "{log.catatan}"
                                </p>
                              )}

                              {/* Items used */}
                              {log.detailPemeliharaan.length > 0 && (
                                <div className="bg-muted/30 rounded-2xl p-4 mt-4">
                                  <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-3">Suku Cadang & Item Terpakai:</p>
                                  <div className="space-y-2">
                                    {log.detailPemeliharaan.map((item, i) => (
                                      <div key={i} className="flex items-center justify-between text-xs">
                                        <div className="flex items-center gap-2">
                                          <div className="w-1.5 h-1.5 rounded-full bg-primary/30" />
                                          <span className="font-medium">{item.namaItem || "Item Persediaan"}</span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                          <span className="text-muted-foreground">x{item.jumlah}</span>
                                          <span className="font-bold">{formatRupiah(Number(item.hargaSatuan) * item.jumlah)}</span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Footer Actions */}
              <div className="p-6 border-t bg-card/50 flex flex-col sm:flex-row justify-between gap-3">
                <button 
                  onClick={() => window.print()}
                  className="flex items-center justify-center gap-2 px-6 py-3 border border-primary text-primary text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-primary/5 transition-all"
                >
                  <Printer className="w-4 h-4" /> Cetak Kartu Pemeliharaan
                </button>
                <button 
                  className="flex items-center justify-center gap-2 px-8 py-3 bg-primary text-white text-xs font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                >
                  Tambah Servis Baru
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
