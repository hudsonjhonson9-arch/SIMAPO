// src/app/(dashboard)/admin/approval/page.tsx
import { Header } from "@/components/shared/Header";
import { ApprovalClient } from "@/components/admin/ApprovalClient";
import { getRequestList } from "@/actions/request.actions";

export const dynamic = "force-dynamic";

export default async function ApprovalPage() {
  const [menunggu, selesai] = await Promise.all([
    getRequestList("MENUNGGU"),
    getRequestList("DISETUJUI"),
  ]);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header
        title="Approval Permintaan ATK"
        subtitle="Review dan setujui permintaan barang dari pegawai"
      />
      <main className="flex-1 overflow-y-auto p-6">
        <ApprovalClient menunggu={menunggu} selesai={selesai} />
      </main>
    </div>
  );
}
