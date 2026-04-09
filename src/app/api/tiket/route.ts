// src/app/api/tiket/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const userId = (session.user as { id: string }).id;
    const body = await req.json();
    const { nomorTiket, judul, deskripsi, prioritas, lokasi } = body;

    if (!judul || !deskripsi) {
      return NextResponse.json({ success: false, error: "Judul dan deskripsi wajib diisi" }, { status: 400 });
    }

    const tiket = await db.tiketKerusakan.create({
      data: {
        nomorTiket,
        userId,
        judul,
        deskripsi,
        prioritas: prioritas ?? "NORMAL",
        lokasi,
        status: "MENUNGGU_PENGECEKAN",
      },
    });

    return NextResponse.json({ success: true, data: tiket });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
