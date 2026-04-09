// src/app/(dashboard)/admin/master-barang/page.tsx
import { Header } from "@/components/shared/Header";
import { MasterBarangClient } from "@/components/admin/MasterBarangClient";
import { getBarangList } from "@/actions/barang.actions";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function MasterBarangPage() {
  const [barangList, kategoriList] = await Promise.all([
    getBarangList(),
    db.kategoriBarang.findMany({ orderBy: { nama: "asc" } }),
  ]);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header
        title="Master Barang"
        subtitle="Kelola data barang habis pakai dan aset tetap"
      />
      <main className="flex-1 overflow-y-auto p-6">
        <MasterBarangClient
          initialData={barangList}
          kategoriList={kategoriList}
        />
      </main>
    </div>
  );
}
