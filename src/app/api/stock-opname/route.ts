// src/app/api/stock-opname/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || (session.user as { role: string }).role !== "ADMIN_GUDANG") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { nomorOpname, status, rows } = await req.json();
    const userId = (session.user as { id: string }).id;

    await db.$transaction(async (tx) => {
      const opname = await tx.stockOpname.create({
        data: {
          nomorOpname,
          status,
          createdById: userId,
          detailOpname: {
            create: rows.map((r: { barangId: string; stokSistem: number; stokFisik: number; selisih: number; keterangan: string }) => ({
              barangId: r.barangId,
              stokSistem: r.stokSistem,
              stokFisik: r.stokFisik,
              selisih: r.selisih,
              keterangan: r.keterangan,
            })),
          },
        },
      });

      // Jika FINAL → terapkan adjustment stok
      if (status === "FINAL") {
        for (const r of rows) {
          if (r.selisih !== 0) {
            await tx.barang.update({
              where: { id: r.barangId },
              data: { stokSaatIni: r.stokFisik },
            });
            await tx.mutasiBarang.create({
              data: {
                ...(r.selisih > 0
                  ? { barangMasukId: r.barangId }
                  : { barangKeluarId: r.barangId }),
                jumlah: Math.abs(r.selisih),
                hargaSatuan: 0,
                keterangan: `Adjustment Stock Opname ${opname.nomorOpname}`,
                referensiId: opname.id,
                referensiType: "OPNAME",
                createdById: userId,
              },
            });
          }
        }
      }
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
