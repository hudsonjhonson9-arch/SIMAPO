// src/app/(dashboard)/pegawai/helpdesk/page.tsx
import { Header } from "@/components/shared/Header";
import { HelpdeskClient } from "@/components/pegawai/HelpdeskClient";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function HelpdeskPage() {
  const session = await auth();
  const userId = (session?.user as { id: string }).id;

  const tiket = await db.tiketKerusakan.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header
        title="Lapor Kerusakan (Helpdesk)"
        subtitle="Buat tiket untuk kerusakan fasilitas atau perangkat kantor"
      />
      <main className="flex-1 overflow-y-auto p-6">
        <HelpdeskClient tiket={tiket} />
      </main>
    </div>
  );
}
