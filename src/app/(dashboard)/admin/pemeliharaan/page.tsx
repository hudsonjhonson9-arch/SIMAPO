// src/app/(dashboard)/admin/pemeliharaan/page.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Header } from "@/components/shared/Header";
import { PemeliharaanClient } from "@/components/admin/PemeliharaanClient";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function PemeliharaanPage() {
  const session = await auth();
  if (!session || (session.user as { role: string }).role !== "ADMIN_GUDANG") {
    redirect("/login");
  }

  // Fetch units with their maintenance history and barang details
  const units = await db.unitAset.findMany({
    include: {
      barang: true,
      pemeliharaan: {
        orderBy: { tanggal: "desc" },
        include: {
          detailPemeliharaan: {
            include: { barang: { select: { nama: true } } }
          }
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header 
        title="Kartu Pemeliharaan" 
        subtitle="Riwayat service dan perawatan aset tetap badan" 
      />
      <main className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
        <PemeliharaanClient units={units as any} />
      </main>
    </div>
  );
}
