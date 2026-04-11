// src/actions/barang-masuk.actions.ts
"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const barangMasukSchema = z.object({
  barangId:     z.string().min(1, "Pilih barang"),
  jumlah:       z.coerce.number().min(1, "Jumlah minimal 1"),
  hargaSatuan:  z.coerce.number().min(0, "Harga tidak valid"),
  keterangan:   z.string().optional(),
  tanggal:      z.string().optional(),
  
  // SIPD & Procurement fields
  penyedia:           z.string().optional(),
  tanggalKwitansi:    z.string().optional(),
  tanggalBeritaAcara: z.string().optional(),
  noBeritaAcara:      z.string().optional(),
  noBKU:              z.string().optional(),
  kodeSubKegiatan:    z.string().optional(),
  kodeBelanja:        z.string().optional(),
});

export async function addBarangMasuk(formData: FormData) {
  const session = await auth();
  if (!session || (session.user as { role: string }).role !== "ADMIN_GUDANG") {
    return { success: false, error: "Tidak memiliki izin" };
  }

  const raw = Object.fromEntries(formData.entries());
  const parsed = barangMasukSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.flatten().fieldErrors };
  }

  try {
    await db.$transaction(async (tx) => {
      // Tambah stok barang
      await tx.barang.update({
        where: { id: parsed.data.barangId },
        data: { stokSaatIni: { increment: parsed.data.jumlah } },
      });

      // Catat mutasi masuk
      await tx.mutasiBarang.create({
        data: {
          barangMasukId: parsed.data.barangId,
          jumlah: parsed.data.jumlah,
          hargaSatuan: parsed.data.hargaSatuan,
          keterangan: parsed.data.keterangan ?? "Penerimaan barang",
          referensiType: "PENERIMAAN",
          tanggal: parsed.data.tanggal ? new Date(parsed.data.tanggal) : new Date(),
          createdById: (session.user as { id: string }).id,

          // Metadata pengadaan
          penyedia:           parsed.data.penyedia,
          tanggalKwitansi:    parsed.data.tanggalKwitansi ? new Date(parsed.data.tanggalKwitansi) : null,
          tanggalBeritaAcara: parsed.data.tanggalBeritaAcara ? new Date(parsed.data.tanggalBeritaAcara) : null,
          noBeritaAcara:      parsed.data.noBeritaAcara,
          noBKU:              parsed.data.noBKU,
          kodeSubKegiatan:    parsed.data.kodeSubKegiatan,
          kodeBelanja:        parsed.data.kodeBelanja,
        },
      });
    });

    revalidatePath("/admin/master-barang");
    revalidatePath("/admin/barang-masuk");
    return { success: true };
  } catch (e) {
    console.error(e);
    return { success: false, error: "Gagal mencatat barang masuk" };
  }
}

export async function getBarangMasukHistory() {
  return db.mutasiBarang.findMany({
    where: { referensiType: "PENERIMAAN" },
    include: {
      barangMasuk: { select: { nama: true, satuan: true, kodeBarang: true } },
      createdBy:   { select: { name: true } },
    },
    orderBy: { tanggal: "desc" },
    take: 100,
  });
}
