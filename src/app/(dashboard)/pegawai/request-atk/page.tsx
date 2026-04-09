// src/app/(dashboard)/pegawai/request-atk/page.tsx
import { Header } from "@/components/shared/Header";
import { RequestATKClient } from "@/components/pegawai/RequestATKClient";
import { getBarangList } from "@/actions/barang.actions";
import { getRequestList } from "@/actions/request.actions";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function RequestATKPage() {
  const session = await auth();
  const userId = (session?.user as { id: string }).id;

  const [barangList, riwayat] = await Promise.all([
    getBarangList(undefined, "HABIS_PAKAI"),
    getRequestList(undefined, userId),
  ]);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header
        title="Request Barang ATK"
        subtitle="Pilih barang yang dibutuhkan dan ajukan permintaan"
      />
      <main className="flex-1 overflow-y-auto p-6">
        <RequestATKClient barangList={barangList} riwayat={riwayat} />
      </main>
    </div>
  );
}
