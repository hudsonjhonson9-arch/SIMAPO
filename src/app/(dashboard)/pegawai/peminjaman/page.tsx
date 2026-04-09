// src/app/(dashboard)/pegawai/peminjaman/page.tsx
import { Header } from "@/components/shared/Header";
import { PeminjamanClient } from "@/components/pegawai/PeminjamanClient";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function PeminjamanPage() {
  const session = await auth();
  const userId = (session?.user as { id: string }).id;

  const [asetTersedia, riwayatPeminjaman] = await Promise.all([
    db.unitAset.findMany({
      where: { statusPinjam: false, kondisi: { in: ["BAIK", "RUSAK_RINGAN"] } },
      include: { barang: { include: { kategori: true } } },
      orderBy: { barang: { nama: "asc" } },
    }),
    db.peminjaman.findMany({
      where: { userId },
      include: { unitAset: { include: { barang: true } } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header
        title="Peminjaman Aset"
        subtitle="Pinjam kendaraan dinas, laptop, proyektor, dan aset lainnya"
      />
      <main className="flex-1 overflow-y-auto p-6">
        <PeminjamanClient asetTersedia={asetTersedia} riwayat={riwayatPeminjaman} />
      </main>
    </div>
  );
}
