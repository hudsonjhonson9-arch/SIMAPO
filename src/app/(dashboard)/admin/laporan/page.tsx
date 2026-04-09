// src/app/(dashboard)/admin/laporan/page.tsx
import { Header } from "@/components/shared/Header";
import { LaporanClient } from "@/components/admin/LaporanClient";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function LaporanPage() {
  const [mutasi, barangList] = await Promise.all([
    db.mutasiBarang.findMany({
      include: {
        barangMasuk:  { select: { nama: true, satuan: true, kodeBarang: true } },
        barangKeluar: { select: { nama: true, satuan: true, kodeBarang: true } },
        createdBy:    { select: { name: true } },
      },
      orderBy: { tanggal: "desc" },
      take: 200,
    }),
    db.barang.findMany({
      where: { isActive: true, jenisBarang: "HABIS_PAKAI" },
      orderBy: { nama: "asc" },
    }),
  ]);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header title="Laporan & Export" subtitle="Cetak laporan dan export data untuk SIPD" />
      <main className="flex-1 overflow-y-auto p-6">
        <LaporanClient mutasi={mutasi} barangList={barangList} />
      </main>
    </div>
  );
}
