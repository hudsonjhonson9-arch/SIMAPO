// src/app/(dashboard)/eksekutif/dashboard/page.tsx
import { Header } from "@/components/shared/Header";
import { db } from "@/lib/db";
import { formatRupiah } from "@/lib/utils";
import { DashboardCharts } from "@/components/eksekutif/DashboardCharts";
import {
  TrendingUp, Package, Wrench, AlertTriangle,
  BarChart3, ArrowUpRight,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function EksekutifDashboard() {
  const [
    totalBarang,
    unitAset,
    stokMenipis,
    requestBulanIni,
    tiketAktif,
    mutasiKeluar,
  ] = await Promise.all([
    db.barang.count({ where: { isActive: true } }),
    db.unitAset.findMany({ include: { barang: true } }),
    db.barang.findMany({
      where: {
        isActive: true,
        jenisBarang: "HABIS_PAKAI",
      },
      take: 5,
    }).then(items => items.filter(b => b.stokSaatIni <= b.minimumStok)).catch(() => []),
    db.requestBarang.count({
      where: {
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
    }),
    db.tiketKerusakan.count({
      where: { status: { in: ["MENUNGGU_PENGECEKAN", "PROSES_SERVIS"] } },
    }),
    db.mutasiBarang.findMany({
      where: {
        referensiType: "REQUEST",
        tanggal: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
      include: {
        barangKeluar: {
          include: { kategori: true },
        },
      },
    }),
  ]);

  // Hitung total nilai aset
  const totalNilaiAset = unitAset.reduce(
    (sum, u) => sum + Number(u.nilaiPerolehan ?? 0),
    0
  );
  const asetRusak = unitAset.filter((u) =>
    ["RUSAK_BERAT", "RUSAK_RINGAN"].includes(u.kondisi)
  ).length;

  // Nilai pengeluaran ATK bulan ini
  const pengeluaranBulanIni = mutasiKeluar.reduce(
    (sum, m) => sum + Number(m.hargaSatuan) * m.jumlah,
    0
  );

  // Ringkasan per kategori untuk chart
  const byKategori: Record<string, number> = {};
  for (const m of mutasiKeluar) {
    const nama = m.barangKeluar?.kategori?.nama ?? "Lainnya";
    byKategori[nama] = (byKategori[nama] ?? 0) + Number(m.hargaSatuan) * m.jumlah;
  }
  const chartData = Object.entries(byKategori)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  const scorecards = [
    {
      label: "Total Nilai Aset",
      value: formatRupiah(totalNilaiAset),
      sub: `${unitAset.length} unit aset terdaftar`,
      icon: <TrendingUp className="w-5 h-5" />,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Total Barang",
      value: totalBarang.toString(),
      sub: "Item dalam master data",
      icon: <Package className="w-5 h-5" />,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      label: "Aset Bermasalah",
      value: asetRusak.toString(),
      sub: "Unit rusak / perlu servis",
      icon: <Wrench className="w-5 h-5" />,
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
    {
      label: "Stok Menipis",
      value: stokMenipis.length.toString(),
      sub: "Item di bawah minimum",
      icon: <AlertTriangle className="w-5 h-5" />,
      color: "text-red-600",
      bg: "bg-red-50",
    },
    {
      label: "Request Bulan Ini",
      value: requestBulanIni.toString(),
      sub: "Permintaan ATK masuk",
      icon: <BarChart3 className="w-5 h-5" />,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      label: "Tiket Aktif",
      value: tiketAktif.toString(),
      sub: "Kerusakan belum selesai",
      icon: <AlertTriangle className="w-5 h-5" />,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
  ];

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header
        title="Dashboard Eksekutif"
        subtitle="Ringkasan kondisi aset dan persediaan instansi"
      />
      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Scorecards */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {scorecards.map((s, i) => (
            <div
              key={s.label}
              className="stat-card animate-fade-in"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center ${s.color}`}>
                  {s.icon}
                </div>
                <ArrowUpRight className="w-4 h-4 text-muted-foreground/40" />
              </div>
              <p className="text-2xl font-bold text-foreground leading-none">{s.value}</p>
              <p className="text-sm font-medium text-foreground mt-1">{s.label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.sub}</p>
            </div>
          ))}
        </div>

        {/* Charts + Stok menipis */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pengeluaran ATK chart */}
          <div className="lg:col-span-2 bg-card rounded-xl border shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-sm">Pengeluaran ATK Bulan Ini</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Per kategori barang</p>
              </div>
              <span className="text-sm font-bold text-primary">{formatRupiah(pengeluaranBulanIni)}</span>
            </div>
            <DashboardCharts data={chartData} />
          </div>

          {/* Stok menipis */}
          <div className="bg-card rounded-xl border shadow-sm p-5">
            <h3 className="font-semibold text-sm mb-3">Early Warning: Stok Menipis</h3>
            {stokMenipis.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-xs">Semua stok aman</p>
              </div>
            ) : (
              <div className="space-y-2">
                {stokMenipis.map((b) => (
                  <div key={b.id} className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-amber-900 truncate">{b.nama}</p>
                      <p className="text-[10px] text-amber-700">Min: {b.minimumStok}</p>
                    </div>
                    <div className="text-right ml-2">
                      <p className="text-sm font-bold text-amber-700">{b.stokSaatIni}</p>
                      <p className="text-[10px] text-amber-600">{b.satuan}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
