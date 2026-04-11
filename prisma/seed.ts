// prisma/seed.ts
import { PrismaClient, Role, JenisBarang, KondisiBarang } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Memulai seed database dengan standar SIPD...");

  // ── Bidang ──────────────────────────────────────────────
  const bidangData = [
    { kode: "1.01.02.1.01.01", nama: "Sekretariat",               deskripsi: "Unit kesekretariatan dinas" },
    { kode: "1.01.02.1.01.02", nama: "Bidang Perencanaan",         deskripsi: "Bidang perencanaan dan anggaran" },
    { kode: "1.01.02.1.01.03", nama: "Bidang Pelayanan",           deskripsi: "Bidang pelayanan publik" },
    { kode: "1.01.02.1.01.04", nama: "Bidang Pengawasan",          deskripsi: "Bidang pengawasan dan evaluasi" },
    { kode: "1.01.02.1.01.05", nama: "Sub Bagian Umum & Kepegawaian", deskripsi: "Sub bagian umum dan kepegawaian" },
  ];

  for (const b of bidangData) {
    await prisma.bidang.upsert({
      where: { kode: b.kode },
      update: { nama: b.nama, deskripsi: b.deskripsi },
      create: b,
    });
  }
  console.log("✅ Bidang SIPD selesai");

  // ── Kategori Barang ──────────────────────────────────────
  const kategoriData = [
    { nama: "Alat Tulis Kantor",      kodeRekening: "5.1.02.01.01.0024" },
    { nama: "Kertas & Bahan Cetak",   kodeRekening: "5.1.02.01.01.0025" },
    { nama: "Peralatan Kebersihan",   kodeRekening: "5.1.02.01.01.0026" },
    { nama: "Komputer & Laptop",      kodeRekening: "5.1.02.01.01.0027" },
    { nama: "Printer & Scanner",      kodeRekening: "5.1.02.01.01.0028" },
    { nama: "Perabot Kantor",         kodeRekening: "5.1.02.01.01.0029" },
    { nama: "Kendaraan Roda 4",       kodeRekening: "5.1.02.01.01.0030" },
    { nama: "Kendaraan Roda 2",       kodeRekening: "5.1.02.01.01.0031" },
    { nama: "Peralatan Audio Visual", kodeRekening: "5.1.02.01.01.0032" },
  ];

  const kategoriMap: Record<string, string> = {};
  for (const k of kategoriData) {
    const created = await prisma.kategoriBarang.upsert({
      where: { id: k.kodeRekening || "dummy" },
      update: { nama: k.nama },
      create: k,
    }).catch(async () => {
      const existing = await prisma.kategoriBarang.findFirst({ where: { nama: k.nama } });
      if (existing) return existing;
      return await prisma.kategoriBarang.create({ data: k });
    });
    kategoriMap[k.nama] = created.id;
  }
  console.log("✅ Kategori Barang SIPD selesai");

  // ── Barang ──────────────────────────────────────────────
  const barangHabisData = [
    { kodeBarang: "5.1.02.01.01.0025.0001", kodeRekening: "5.1.02.01.01.0025", nama: "Kertas HVS A4 80gr",   satuan: "rim",  stokSaatIni: 50,  minimumStok: 10, hargaSatuan: 55000,  kategoriNama: "Kertas & Bahan Cetak" },
    { kodeBarang: "5.1.02.01.01.0024.0001", kodeRekening: "5.1.02.01.01.0024", nama: "Pulpen Ballpoint Biru", satuan: "pcs",  stokSaatIni: 100, minimumStok: 20, hargaSatuan: 3500,   kategoriNama: "Alat Tulis Kantor" },
    { kodeBarang: "5.1.02.01.01.0024.0002", kodeRekening: "5.1.02.01.01.0024", nama: "Stapler Besar",          satuan: "pcs",  stokSaatIni: 10,  minimumStok: 3,  hargaSatuan: 45000,  kategoriNama: "Alat Tulis Kantor" },
    { kodeBarang: "1.3.02.01.01.0002.0001", kodeRekening: "1.3.02.01.01.0002", nama: "Laptop Dell Latitude",  satuan: "unit", stokSaatIni: 0,   minimumStok: 0,  hargaSatuan: 12500000, kategoriNama: "Komputer & Laptop" },
  ];

  for (const b of barangHabisData) {
    await prisma.barang.upsert({
      where: { kodeBarang: b.kodeBarang },
      update: { stokSaatIni: b.stokSaatIni, hargaSatuan: b.hargaSatuan },
      create: {
        kodeBarang: b.kodeBarang,
        kodeRekening: b.kodeRekening,
        nama: b.nama,
        satuan: b.satuan,
        jenisBarang: b.hargaSatuan > 500000 ? JenisBarang.ASET_TETAP : JenisBarang.HABIS_PAKAI,
        stokSaatIni: b.stokSaatIni,
        minimumStok: b.minimumStok,
        hargaSatuan: b.hargaSatuan,
        kategoriId: kategoriMap[b.kategoriNama],
      },
    });
  }
  console.log("✅ Master Barang SIPD selesai");

  // ── Users ────────────────────────────────────────────────
  const hashedPassword = await bcrypt.hash("password123", 10);
  const bidangSekretariat = await prisma.bidang.findUnique({ where: { kode: "1.01.02.1.01.01" } });

  const admin = await prisma.user.upsert({
    where: { email: "admin@simapo.go.id" },
    update: { role: Role.ADMIN_GUDANG },
    create: {
      name: "Administrator SIMAPO",
      nip: "197801012005011001",
      email: "admin@simapo.go.id",
      password: hashedPassword,
      role: Role.ADMIN_GUDANG,
      bidangId: bidangSekretariat?.id,
    },
  });

  console.log("✅ Users selesai");

  // ── Contoh Unit Aset ──────────────────────────────────
  const laptop = await prisma.barang.findFirst({ where: { nama: { contains: "Laptop" } } });
  if (laptop && bidangSekretariat) {
    await prisma.unitAset.upsert({
      where: { nomorInventaris: "INV/2024/001" },
      update: {},
      create: {
        barangId: laptop.id,
        nomorInventaris: "INV/2024/001",
        qrCode: "QR-LAPTOP-001",
        kondisi: KondisiBarang.BAIK,
        bidangId: bidangSekretariat.id,
        kodeSubKegiatan: "1.01.02.1.01.01",
        kodeBelanja: "5.2.02.01.01.0001",
        tahunPerolehan: 2024,
        nilaiPerolehan: 12500000,
      }
    });
  }
  console.log("✅ Unit Aset Contoh selesai");

  console.log("\n🎉 Seed database SIPD selesai!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
