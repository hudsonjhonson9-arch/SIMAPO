// src/actions/bidang.actions.ts
"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const bidangSchema = z.object({
  kode:       z.string().min(1, "Kode bidang wajib diisi"),
  nama:       z.string().min(1, "Nama bidang wajib diisi"),
  deskripsi:  z.string().optional(),
});

export async function createBidang(formData: FormData) {
  const session = await auth();
  if (!session || (session.user as { role: string }).role !== "ADMIN_GUDANG") {
    return { success: false, error: "Tidak memiliki izin" };
  }

  const raw = Object.fromEntries(formData.entries());
  const parsed = bidangSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.flatten().fieldErrors };
  }

  try {
    const existing = await db.bidang.findUnique({ where: { kode: parsed.data.kode } });
    if (existing) return { success: false, error: "Kode bidang sudah digunakan" };

    const bidang = await db.bidang.create({ data: parsed.data });
    revalidatePath("/admin/master-bidang");
    return { success: true, data: bidang };
  } catch (e) {
    console.error(e);
    return { success: false, error: "Gagal menyimpan data bidang" };
  }
}

export async function updateBidang(id: string, formData: FormData) {
  const session = await auth();
  if (!session || (session.user as { role: string }).role !== "ADMIN_GUDANG") {
    return { success: false, error: "Tidak memiliki izin" };
  }

  const raw = Object.fromEntries(formData.entries());
  const parsed = bidangSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.flatten().fieldErrors };
  }

  try {
    const bidang = await db.bidang.update({ where: { id }, data: parsed.data });
    revalidatePath("/admin/master-bidang");
    return { success: true, data: bidang };
  } catch (e) {
    console.error(e);
    return { success: false, error: "Gagal memperbarui data bidang" };
  }
}

export async function deleteBidang(id: string) {
  const session = await auth();
  if (!session || (session.user as { role: string }).role !== "ADMIN_GUDANG") {
    return { success: false, error: "Tidak memiliki izin" };
  }

  try {
    await db.bidang.update({ where: { id }, data: { isActive: false } });
    revalidatePath("/admin/master-bidang");
    return { success: true };
  } catch (e) {
    console.error(e);
    return { success: false, error: "Gagal menghapus data bidang" };
  }
}

export async function getBidangList() {
  return db.bidang.findMany({
    where: { isActive: true },
    include: { _count: { select: { users: true, unitAset: true } } },
    orderBy: { kode: "asc" },
  });
}
