// src/app/(dashboard)/admin/helpdesk/page.tsx
import { Header } from "@/components/shared/Header";
import { AdminHelpdeskClient } from "@/components/admin/AdminHelpdeskClient";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminHelpdeskPage() {
  const tiket = await db.tiketKerusakan.findMany({
    include: { user: { select: { name: true, bidang: { select: { nama: true } } } } },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
  });

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header title="Helpdesk & Tiket Kerusakan" subtitle="Kelola laporan kerusakan dan jadwal perawatan" />
      <main className="flex-1 overflow-y-auto p-6">
        <AdminHelpdeskClient tiket={tiket} />
      </main>
    </div>
  );
}
