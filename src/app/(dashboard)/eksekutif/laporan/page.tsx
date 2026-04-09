// src/app/(dashboard)/eksekutif/laporan/page.tsx
import { Header } from "@/components/shared/Header";
import { db } from "@/lib/db";
import { formatRupiah, formatTanggal } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function EksekutifLaporanPage() {
  const [requestList, peminjamanList] = await Promise.all([
    db.requestBarang.findMany({
      include: {
        requester: { select: { name: true } },
        bidang: { select: { nama: true } },
        detailRequest: { include: { barang: { select: { nama: true, hargaSatuan: true, satuan: true } } } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    db.peminjaman.findMany({
      include: {
        user: { select: { name: true } },
        unitAset: { include: { barang: { select: { nama: true } } } },
      },
      orderBy: { createdAt: "desc" },
      take: 30,
    }),
  ]);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header title="Laporan Mutasi Aset" subtitle="Ringkasan permintaan dan peminjaman aset" />
      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Request ATK */}
        <section>
          <h2 className="text-sm font-bold text-foreground mb-3">Riwayat Permintaan ATK (50 Terbaru)</h2>
          <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/30">
                    {["No. Request", "Pemohon", "Bidang", "Tanggal", "Item", "Status"].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {requestList.map(r => {
                    const totalNilai = r.detailRequest.reduce(
                      (s, d) => s + Number(d.barang.hargaSatuan) * d.jumlahDiminta, 0
                    );
                    return (
                      <tr key={r.id} className="hover:bg-muted/20">
                        <td className="px-4 py-3"><code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">{r.nomorRequest}</code></td>
                        <td className="px-4 py-3 text-sm font-medium">{r.requester.name}</td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">{r.bidang.nama}</td>
                        <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{formatTanggal(r.createdAt)}</td>
                        <td className="px-4 py-3 text-sm">
                          {r.detailRequest.length} item · <span className="font-semibold">{formatRupiah(totalNilai)}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`badge-status ${
                            r.status === "MENUNGGU" ? "bg-amber-100 text-amber-700" :
                            r.status === "DISETUJUI" ? "bg-green-100 text-green-700" :
                            r.status === "DITOLAK" ? "bg-red-100 text-red-700" :
                            "bg-blue-100 text-blue-700"
                          }`}>{r.status}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Peminjaman */}
        <section>
          <h2 className="text-sm font-bold text-foreground mb-3">Riwayat Peminjaman Aset (30 Terbaru)</h2>
          <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/30">
                    {["No. Peminjaman", "Peminjam", "Aset", "Tgl Mulai", "Tgl Selesai", "Status"].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {peminjamanList.map(p => (
                    <tr key={p.id} className="hover:bg-muted/20">
                      <td className="px-4 py-3"><code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">{p.nomorPeminjaman}</code></td>
                      <td className="px-4 py-3 text-sm font-medium">{p.user.name}</td>
                      <td className="px-4 py-3 text-sm">{p.unitAset.barang.nama}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{formatTanggal(p.tanggalMulai)}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{formatTanggal(p.tanggalSelesai)}</td>
                      <td className="px-4 py-3">
                        <span className={`badge-status ${
                          p.status === "MENUNGGU" ? "bg-amber-100 text-amber-700" :
                          p.status === "DIPINJAM" ? "bg-blue-100 text-blue-700" :
                          p.status === "DIKEMBALIKAN" ? "bg-green-100 text-green-700" :
                          "bg-gray-100 text-gray-700"
                        }`}>{p.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
