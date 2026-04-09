// src/app/(dashboard)/admin/master-bidang/page.tsx
import { Header } from "@/components/shared/Header";
import { MasterBidangClient } from "@/components/admin/MasterBidangClient";
import { getBidangList } from "@/actions/bidang.actions";

export const dynamic = "force-dynamic";

export default async function MasterBidangPage() {
  const bidangList = await getBidangList();

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header
        title="Master Bidang / Unit Kerja"
        subtitle="Kelola data bidang dan unit kerja instansi"
      />
      <main className="flex-1 overflow-y-auto p-6">
        <MasterBidangClient initialData={bidangList} />
      </main>
    </div>
  );
}
