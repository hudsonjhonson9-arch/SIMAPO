// src/app/api/users/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import type { Role } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || (session.user as { role: string }).role !== "ADMIN_GUDANG") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    const { name, nip, email, password, role, bidangId } = await req.json();
    if (!name || !email || !password || !role) {
      return NextResponse.json({ success: false, error: "Field wajib tidak lengkap" }, { status: 400 });
    }
    const existing = await db.user.findUnique({ where: { email } });
    if (existing) return NextResponse.json({ success: false, error: "Email sudah terdaftar" }, { status: 400 });

    const hashed = await bcrypt.hash(password, 10);
    const user = await db.user.create({
      data: { name, nip: nip || null, email, password: hashed, role: role as Role, bidangId: bidangId || null },
    });
    return NextResponse.json({ success: true, data: { id: user.id } });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || (session.user as { role: string }).role !== "ADMIN_GUDANG") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    const { id, name, nip, email, password, role, bidangId, isActive } = await req.json();
    if (!id) return NextResponse.json({ success: false, error: "ID diperlukan" }, { status: 400 });

    const updateData: Record<string, unknown> = {};
    if (name !== undefined)     updateData.name     = name;
    if (nip !== undefined)      updateData.nip      = nip || null;
    if (email !== undefined)    updateData.email    = email;
    if (role !== undefined)     updateData.role     = role as Role;
    if (bidangId !== undefined) updateData.bidangId = bidangId || null;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (password)               updateData.password = await bcrypt.hash(password, 10);

    await db.user.update({ where: { id }, data: updateData });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
