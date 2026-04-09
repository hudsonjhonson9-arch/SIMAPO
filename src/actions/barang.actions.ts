// src/actions/barang.actions.ts
"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { JenisBarang } from "@prisma/client";

const barangSchema = z.object({
  kodeBarang:   z.string().min(1, "Kode barang wajib diisi"),
  kodeRekening: z.string().optional(),
  nama:         z.string().min(1, "Nama barang wajib diisi"),
  satuan:       z.string().min(1, "Satuan wajib diisi"),
  jenisBarang:  z.enum(["HABIS_PAKAI", "ASET_TETAP"]),
  kategoriId:   z.string().optional(),
  spesifikasi:  z.string().optional(),
  stokSaatIni:  z.coerce.number().min(0).default(0),
  minimumStok:  z.coerce.number().min(0).default(0),
  hargaSatuan:  z.coerce.number().min(0).default(0),
});

export async function createBarang(formData: FormData) {
  const session = await auth();
  if (!session || (session.user as { role: string }).role !== "ADMIN_GUDANG") {
    return { success: false, error: "Tidak memiliki izin" };
  }

  const raw = Object.fromEntries(formData.entries());
  const parsed = barangSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.flatten().fieldErrors };
  }

  try {
    const existing = await db.barang.findUnique({
      where: { kodeBarang: parsed.data.kodeBarang },
    });
    if (existing) {
      return { success: false, error: "Kode barang sudah digunakan" };
    }

    const barang = await db.barang.create({
      data: {
        ...parsed.data,
        jenisBarang: parsed.data.jenisBarang as JenisBarang,
        hargaSatuan: parsed.data.hargaSatuan,
        kategoriId: parsed.data.kategoriId || null,
      },
    });

    revalidatePath("/admin/master-barang");
    return { success: true, data: barang };
  } catch (e) {
    console.error(e);
    return { success: false, error: "Gagal menyimpan data barang" };
  }
}

export async function updateBarang(id: string, formData: FormData) {
  const session = await auth();
  if (!session || (session.user as { role: string }).role !== "ADMIN_GUDANG") {
    return { success: false, error: "Tidak memiliki izin" };
  }

  const raw = Object.fromEntries(formData.entries());
  const parsed = barangSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.flatten().fieldErrors };
  }

  try {
    const barang = await db.barang.update({
      where: { id },
      data: {
        ...parsed.data,
        jenisBarang: parsed.data.jenisBarang as JenisBarang,
        hargaSatuan: parsed.data.hargaSatuan,
        kategoriId: parsed.data.kategoriId || null,
      },
    });

    revalidatePath("/admin/master-barang");
    return { success: true, data: barang };
  } catch (e) {
    console.error(e);
    return { success: false, error: "Gagal memperbarui data barang" };
  }
}

export async function deleteBarang(id: string) {
  const session = await auth();
  if (!session || (session.user as { role: string }).role !== "ADMIN_GUDANG") {
    return { success: false, error: "Tidak memiliki izin" };
  }

  try {
    await db.barang.update({
      where: { id },
      data: { isActive: false },
    });

    revalidatePath("/admin/master-barang");
    return { success: true };
  } catch (e) {
    console.error(e);
    return { success: false, error: "Gagal menghapus data barang" };
  }
}

export async function getBarangList(search?: string, jenis?: string) {
  const barang = await db.barang.findMany({
    where: {
      isActive: true,
      ...(search && {
        OR: [
          { nama: { contains: search, mode: "insensitive" } },
          { kodeBarang: { contains: search, mode: "insensitive" } },
        ],
      }),
      ...(jenis && { jenisBarang: jenis as JenisBarang }),
    },
    include: { kategori: true },
    orderBy: { createdAt: "desc" },
  });
  return barang;
}

export async function getBarangById(id: string) {
  return db.barang.findUnique({
    where: { id },
    include: {
      kategori: true,
      unitAset: {
        include: { bidang: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });
}
