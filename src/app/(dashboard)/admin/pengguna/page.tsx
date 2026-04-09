// src/app/(dashboard)/admin/pengguna/page.tsx
import { Header } from "@/components/shared/Header";
import { PenggunaClient } from "@/components/admin/PenggunaClient";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function PenggunaPage() {
  const [users, bidangList] = await Promise.all([
    db.user.findMany({
      include: { bidang: { select: { nama: true, kode: true } } },
      orderBy: { createdAt: "desc" },
    }),
    db.bidang.findMany({ where: { isActive: true }, orderBy: { kode: "asc" } }),
  ]);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header title="Kelola Pengguna" subtitle="Manajemen akun dan hak akses pengguna sistem" />
      <main className="flex-1 overflow-y-auto p-6">
        <PenggunaClient users={users} bidangList={bidangList} />
      </main>
    </div>
  );
}
