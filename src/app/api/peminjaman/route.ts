// src/app/api/peminjaman/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const userId = (session.user as { id: string }).id;
    const body = await req.json();
    const { unitAsetId, tujuanPeminjaman, tanggalMulai, tanggalSelesai, nomorPeminjaman } = body;

    if (!unitAsetId || !tujuanPeminjaman || !tanggalMulai || !tanggalSelesai) {
      return NextResponse.json({ success: false, error: "Data tidak lengkap" }, { status: 400 });
    }

    // Cek aset tersedia
    const aset = await db.unitAset.findUnique({ where: { id: unitAsetId } });
    if (!aset) return NextResponse.json({ success: false, error: "Aset tidak ditemukan" }, { status: 404 });
    if (aset.statusPinjam) return NextResponse.json({ success: false, error: "Aset sedang dipinjam" }, { status: 400 });

    const peminjaman = await db.peminjaman.create({
      data: {
        nomorPeminjaman,
        userId,
        unitAsetId,
        tujuanPeminjaman,
        tanggalMulai: new Date(tanggalMulai),
        tanggalSelesai: new Date(tanggalSelesai),
        status: "MENUNGGU",
      },
    });

    return NextResponse.json({ success: true, data: peminjaman });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
