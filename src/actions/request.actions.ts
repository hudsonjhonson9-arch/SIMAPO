// src/actions/request.actions.ts
"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { generateNomorRequest } from "@/lib/utils";

export interface CartItem {
  barangId: string;
  jumlahDiminta: number;
}

export async function submitRequest(items: CartItem[], catatan?: string) {
  const session = await auth();
  if (!session) return { success: false, error: "Tidak terautentikasi" };

  const user = session.user as { id: string; bidangId?: string; role: string };
  if (user.role !== "PEGAWAI") return { success: false, error: "Hanya pegawai yang bisa request barang" };
  if (!user.bidangId) return { success: false, error: "Akun anda belum terhubung ke bidang" };
  if (!items.length) return { success: false, error: "Keranjang kosong" };

  try {
    // Validasi stok mencukupi
    for (const item of items) {
      const barang = await db.barang.findUnique({ where: { id: item.barangId } });
      if (!barang) return { success: false, error: `Barang tidak ditemukan` };
      if (barang.jenisBarang !== "HABIS_PAKAI") return { success: false, error: `${barang.nama} bukan barang habis pakai` };
      if (barang.stokSaatIni < item.jumlahDiminta) {
        return { success: false, error: `Stok ${barang.nama} tidak mencukupi (tersedia: ${barang.stokSaatIni})` };
      }
    }

    const request = await db.requestBarang.create({
      data: {
        nomorRequest: generateNomorRequest(),
        requesterId: user.id,
        bidangId: user.bidangId,
        catatan,
        detailRequest: {
          create: items.map((item) => ({
            barangId: item.barangId,
            jumlahDiminta: item.jumlahDiminta,
          })),
        },
      },
      include: { detailRequest: true },
    });

    revalidatePath("/pegawai/request-atk");
    revalidatePath("/admin/approval");
    return { success: true, data: request };
  } catch (e) {
    console.error(e);
    return { success: false, error: "Gagal mengajukan permintaan" };
  }
}

export async function approveRequest(requestId: string, details: { detailId: string; jumlahDisetujui: number }[], catatanAdmin?: string) {
  const session = await auth();
  if (!session || (session.user as { role: string }).role !== "ADMIN_GUDANG") {
    return { success: false, error: "Tidak memiliki izin" };
  }

  try {
    await db.$transaction(async (tx) => {
      // Update status request
      await tx.requestBarang.update({
        where: { id: requestId },
        data: {
          status: "DISETUJUI",
          catatanAdmin,
          tanggalApproval: new Date(),
          approvedById: (session.user as { id: string }).id,
        },
      });

      // Update jumlah disetujui dan kurangi stok
      for (const d of details) {
        const detail = await tx.detailRequest.findUnique({
          where: { id: d.detailId },
          include: { barang: true },
        });
        if (!detail) continue;

        await tx.detailRequest.update({
          where: { id: d.detailId },
          data: { jumlahDisetujui: d.jumlahDisetujui },
        });

        // Kurangi stok
        await tx.barang.update({
          where: { id: detail.barangId },
          data: { stokSaatIni: { decrement: d.jumlahDisetujui } },
        });

        // Catat mutasi keluar
        await tx.mutasiBarang.create({
          data: {
            barangKeluarId: detail.barangId,
            jumlah: d.jumlahDisetujui,
            hargaSatuan: detail.barang.hargaSatuan,
            keterangan: `Pengeluaran ATK - Approval Request ${requestId}`,
            referensiId: requestId,
            referensiType: "REQUEST",
            createdById: (session.user as { id: string }).id,
          },
        });
      }
    });

    revalidatePath("/admin/approval");
    revalidatePath("/pegawai/request-atk");
    return { success: true };
  } catch (e) {
    console.error(e);
    return { success: false, error: "Gagal menyetujui permintaan" };
  }
}

export async function rejectRequest(requestId: string, catatanAdmin: string) {
  const session = await auth();
  if (!session || (session.user as { role: string }).role !== "ADMIN_GUDANG") {
    return { success: false, error: "Tidak memiliki izin" };
  }

  try {
    await db.requestBarang.update({
      where: { id: requestId },
      data: {
        status: "DITOLAK",
        catatanAdmin,
        tanggalApproval: new Date(),
      },
    });

    revalidatePath("/admin/approval");
    revalidatePath("/pegawai/request-atk");
    return { success: true };
  } catch (e) {
    console.error(e);
    return { success: false, error: "Gagal menolak permintaan" };
  }
}

export async function getRequestList(status?: string, userId?: string) {
  return db.requestBarang.findMany({
    where: {
      ...(status && { status: status as "MENUNGGU" | "DISETUJUI" | "DITOLAK" | "DISERAHKAN" }),
      ...(userId && { requesterId: userId }),
    },
    include: {
      requester: { select: { name: true, nip: true } },
      bidang:    { select: { nama: true, kode: true } },
      detailRequest: {
        include: { barang: { select: { nama: true, satuan: true, hargaSatuan: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}
