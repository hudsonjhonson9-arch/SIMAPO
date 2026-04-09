// src/app/api/tiket/update/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || (session.user as { role: string }).role !== "ADMIN_GUDANG") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id, status, catatanAdmin } = await req.json();
    if (!id || !status) return NextResponse.json({ success: false, error: "Data kurang" }, { status: 400 });

    const updateData: Record<string, unknown> = { status };
    if (catatanAdmin) updateData.catatanAdmin = catatanAdmin;
    if (status === "SELESAI") updateData.resolvedAt = new Date();

    await db.tiketKerusakan.update({ where: { id }, data: updateData });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
