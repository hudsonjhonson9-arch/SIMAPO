// src/app/api/peminjaman/update/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || (session.user as { role: string }).role !== "ADMIN_GUDANG") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id, status, kondisiAwal, kondisiKembali } = await req.json();
    if (!id || !status) return NextResponse.json({ success: false, error: "Data kurang" }, { status: 400 });

    const updateData: Record<string, unknown> = { status };
    if (kondisiAwal) updateData.kondisiAwal = kondisiAwal;
    if (kondisiKembali) {
      updateData.kondisiKembali = kondisiKembali;
      updateData.tanggalKembali = new Date();
    }

    // Jika dipinjam → update statusPinjam aset
    if (status === "DIPINJAM") {
      const p = await db.peminjaman.findUnique({ where: { id } });
      if (p) await db.unitAset.update({ where: { id: p.unitAsetId }, data: { statusPinjam: true } });
    }

    // Jika dikembalikan → bebaskan aset
    if (status === "DIKEMBALIKAN") {
      const p = await db.peminjaman.findUnique({ where: { id } });
      if (p) await db.unitAset.update({ where: { id: p.unitAsetId }, data: { statusPinjam: false } });
    }

    await db.peminjaman.update({ where: { id }, data: updateData });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
