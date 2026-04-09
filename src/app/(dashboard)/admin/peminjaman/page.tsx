// src/app/(dashboard)/admin/peminjaman/page.tsx
import { Header } from "@/components/shared/Header";
import { AdminPeminjamanClient } from "@/components/admin/AdminPeminjamanClient";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminPeminjamanPage() {
  const peminjaman = await db.peminjaman.findMany({
    include: {
      user: { select: { name: true, nip: true } },
      unitAset: { include: { barang: { select: { nama: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header
        title="Kelola Peminjaman Aset"
        subtitle="Approve dan kelola serah terima aset dinas"
      />
      <main className="flex-1 overflow-y-auto p-6">
        <AdminPeminjamanClient peminjaman={peminjaman} />
      </main>
    </div>
  );
}
