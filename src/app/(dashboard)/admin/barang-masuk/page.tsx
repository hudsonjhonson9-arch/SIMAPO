// src/app/(dashboard)/admin/barang-masuk/page.tsx
import { Header } from "@/components/shared/Header";
import { BarangMasukClient } from "@/components/admin/BarangMasukClient";
import { getBarangMasukHistory } from "@/actions/barang-masuk.actions";
import { getBarangList } from "@/actions/barang.actions";

export const dynamic = "force-dynamic";

export default async function BarangMasukPage() {
  const [history, barangList] = await Promise.all([
    getBarangMasukHistory(),
    getBarangList(undefined, "HABIS_PAKAI"),
  ]);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header
        title="Penerimaan Barang Masuk"
        subtitle="Catat setiap penerimaan barang dan tambahan stok"
      />
      <main className="flex-1 overflow-y-auto p-6">
        <BarangMasukClient history={history} barangList={barangList} />
      </main>
    </div>
  );
}
