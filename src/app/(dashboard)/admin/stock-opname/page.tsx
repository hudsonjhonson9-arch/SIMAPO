// src/app/(dashboard)/admin/stock-opname/page.tsx
import { Header } from "@/components/shared/Header";
import { StockOpnameClient } from "@/components/admin/StockOpnameClient";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function StockOpnamePage() {
  const [barangList, riwayatOpname] = await Promise.all([
    db.barang.findMany({
      where: { isActive: true, jenisBarang: "HABIS_PAKAI" },
      orderBy: { nama: "asc" },
    }),
    db.stockOpname.findMany({
      include: { detailOpname: true },
      orderBy: { tanggal: "desc" },
      take: 10,
    }),
  ]);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header title="Stock Opname & Cek Fisik" subtitle="Rekonsiliasi stok sistem vs stok fisik" />
      <main className="flex-1 overflow-y-auto p-6">
        <StockOpnameClient barangList={barangList} riwayatOpname={riwayatOpname} />
      </main>
    </div>
  );
}
