// src/actions/pemeliharaan.actions.ts
"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const detailSchema = z.object({
  barangId:    z.string().optional().nullable(),
  namaItem:    z.string().nullable(),
  jumlah:      z.coerce.number().min(1),
  hargaSatuan: z.coerce.number().min(0),
});

const pemeliharaanSchema = z.object({
  unitAsetId: z.string().min(1, "Pilih aset"),
  tanggal:    z.string(),
  kegiatan:   z.string().min(3, "Isi nama kegiatan"),
  biayaTotal: z.coerce.number(),
  petugas:    z.string().optional(),
  catatan:    z.string().optional(),
  details:    z.array(detailSchema),
});

export async function addRiwayatPemeliharaan(data: z.infer<typeof pemeliharaanSchema>) {
  const session = await auth();
  if (!session || (session.user as { role: string }).role !== "ADMIN_GUDANG") {
    return { success: false, error: "Tidak memiliki izin" };
  }

  try {
    const result = await db.$transaction(async (tx) => {
      // 1. Create Riwayat
      const riwayat = await tx.riwayatPemeliharaan.create({
        data: {
          unitAsetId: data.unitAsetId,
          tanggal:    new Date(data.tanggal),
          kegiatan:   data.kegiatan,
          biayaTotal: data.biayaTotal,
          petugas:    data.petugas,
          catatan:    data.catatan,
        },
      });

      // 2. Create Details & Update Stock
      for (const item of data.details) {
        await tx.detailPemeliharaan.create({
          data: {
            riwayatId:   riwayat.id,
            barangId:    item.barangId,
            namaItem:    item.namaItem,
            jumlah:      item.jumlah,
            hargaSatuan: item.hargaSatuan,
          },
        });

        // Jika barangId ada, kurangi stok dan catat mutasi keluar
        if (item.barangId) {
          await tx.barang.update({
            where: { id: item.barangId },
            data: { stokSaatIni: { decrement: item.jumlah } },
          });

          await tx.mutasiBarang.create({
            data: {
              barangKeluarId: item.barangId,
              jumlah:         item.jumlah,
              hargaSatuan:    item.hargaSatuan,
              keterangan:     `Pemeliharaan Aset (Ref: ${riwayat.id})`,
              referensiId:    riwayat.id,
              referensiType:  "MAINTENANCE",
              createdById:    (session.user as { id: string }).id,
            },
          });
        }
      }

      return riwayat;
    });

    revalidatePath("/admin/pemeliharaan");
    revalidatePath("/admin/master-barang");
    return { success: true, data: result };
  } catch (e) {
    console.error(e);
    return { success: false, error: "Gagal menyimpan riwayat pemeliharaan" };
  }
}

export async function getUnitAsetWithMaintenance(subKegiatan?: string) {
  return db.unitAset.findMany({
    where: subKegiatan ? { kodeSubKegiatan: subKegiatan } : {},
    include: {
      barang: true,
      pemeliharaan: {
        orderBy: { tanggal: "desc" },
        include: { detailPemeliharaan: true }
      }
    },
    orderBy: { createdAt: "desc" }
  });
}
