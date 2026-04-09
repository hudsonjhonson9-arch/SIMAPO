// prisma/seed.ts
import { PrismaClient, Role, JenisBarang, KondisiBarang } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Memulai seed database...");

  // ── Bidang ──────────────────────────────────────────────
  const bidangData = [
    { kode: "BID-01", nama: "Sekretariat",               deskripsi: "Unit kesekretariatan dinas" },
    { kode: "BID-02", nama: "Bidang Perencanaan",         deskripsi: "Bidang perencanaan dan anggaran" },
    { kode: "BID-03", nama: "Bidang Pelayanan",           deskripsi: "Bidang pelayanan publik" },
    { kode: "BID-04", nama: "Bidang Pengawasan",          deskripsi: "Bidang pengawasan dan evaluasi" },
    { kode: "BID-05", nama: "Sub Bagian Umum & Kepegawaian", deskripsi: "Sub bagian umum dan kepegawaian" },
  ];

  for (const b of bidangData) {
    await prisma.bidang.upsert({
      where: { kode: b.kode },
      update: {},
      create: b,
    });
  }
  console.log("✅ Bidang selesai");

  // ── Kategori Barang ──────────────────────────────────────
  const kategoriData = [
    { nama: "Alat Tulis Kantor",      kodeRekening: "5.2.2.01.01" },
    { nama: "Kertas & Bahan Cetak",   kodeRekening: "5.2.2.01.02" },
    { nama: "Peralatan Kebersihan",   kodeRekening: "5.2.2.01.03" },
    { nama: "Komputer & Laptop",      kodeRekening: "5.2.3.10.01" },
    { nama: "Printer & Scanner",      kodeRekening: "5.2.3.10.02" },
    { nama: "Perabot Kantor",         kodeRekening: "5.2.3.08.01" },
    { nama: "Kendaraan Roda 4",       kodeRekening: "5.2.3.05.01" },
    { nama: "Kendaraan Roda 2",       kodeRekening: "5.2.3.05.02" },
    { nama: "Peralatan Audio Visual", kodeRekening: "5.2.3.10.03" },
  ];

  const kategoriMap: Record<string, string> = {};
  for (const k of kategoriData) {
    const created = await prisma.kategoriBarang.upsert({
      where: { id: k.kodeRekening }, // dummy — akan dibuat baru jika belum ada
      update: {},
      create: k,
    }).catch(async () => {
      // Jika upsert gagal (karena id bukan kodeRekening), cari by nama
      const existing = await prisma.kategoriBarang.findFirst({ where: { nama: k.nama } });
      if (existing) return existing;
      return await prisma.kategoriBarang.create({ data: k });
    });
    kategoriMap[k.nama] = created.id;
  }

  // Re-fetch kategori
  const allKategori = await prisma.kategoriBarang.findMany();
  for (const k of allKategori) kategoriMap[k.nama] = k.id;
  console.log("✅ Kategori Barang selesai");

  // ── Barang ──────────────────────────────────────────────
  const barangHabisData = [
    { kodeBarang: "ATK-0001", kodeRekening: "5.2.2.01.01.0001", nama: "Kertas HVS A4 80gr",   satuan: "rim",  stokSaatIni: 50,  minimumStok: 10, hargaSatuan: 55000,  kategoriNama: "Kertas & Bahan Cetak" },
    { kodeBarang: "ATK-0002", kodeRekening: "5.2.2.01.01.0002", nama: "Pulpen Ballpoint Biru", satuan: "pcs",  stokSaatIni: 100, minimumStok: 20, hargaSatuan: 3500,   kategoriNama: "Alat Tulis Kantor" },
    { kodeBarang: "ATK-0003", kodeRekening: "5.2.2.01.01.0003", nama: "Stapler Besar",          satuan: "pcs",  stokSaatIni: 10,  minimumStok: 3,  hargaSatuan: 45000,  kategoriNama: "Alat Tulis Kantor" },
    { kodeBarang: "ATK-0004", kodeRekening: "5.2.2.01.01.0004", nama: "Isi Stapler No.10",      satuan: "box",  stokSaatIni: 30,  minimumStok: 10, hargaSatuan: 8500,   kategoriNama: "Alat Tulis Kantor" },
    { kodeBarang: "ATK-0005", kodeRekening: "5.2.2.01.01.0005", nama: "Amplop Coklat Besar",   satuan: "pcs",  stokSaatIni: 200, minimumStok: 50, hargaSatuan: 1500,   kategoriNama: "Alat Tulis Kantor" },
    { kodeBarang: "ATK-0006", kodeRekening: "5.2.2.01.01.0006", nama: "Map Plastik Transparan", satuan: "pcs",  stokSaatIni: 80,  minimumStok: 20, hargaSatuan: 5000,   kategoriNama: "Alat Tulis Kantor" },
    { kodeBarang: "ATK-0007", kodeRekening: "5.2.2.01.01.0007", nama: "Tinta Printer Hitam",   satuan: "botol",stokSaatIni: 15,  minimumStok: 5,  hargaSatuan: 85000,  kategoriNama: "Kertas & Bahan Cetak" },
    { kodeBarang: "KBR-0001", kodeRekening: "5.2.2.01.03.0001", nama: "Sabun Cuci Tangan",     satuan: "botol",stokSaatIni: 20,  minimumStok: 5,  hargaSatuan: 25000,  kategoriNama: "Peralatan Kebersihan" },
    { kodeBarang: "KBR-0002", kodeRekening: "5.2.2.01.03.0002", nama: "Tisu Meja",             satuan: "pack", stokSaatIni: 40,  minimumStok: 10, hargaSatuan: 12000,  kategoriNama: "Peralatan Kebersihan" },
  ];

  for (const b of barangHabisData) {
    await prisma.barang.upsert({
      where: { kodeBarang: b.kodeBarang },
      update: {},
      create: {
        kodeBarang: b.kodeBarang,
        kodeRekening: b.kodeRekening,
        nama: b.nama,
        satuan: b.satuan,
        jenisBarang: JenisBarang.HABIS_PAKAI,
        stokSaatIni: b.stokSaatIni,
        minimumStok: b.minimumStok,
        hargaSatuan: b.hargaSatuan,
        kategoriId: kategoriMap[b.kategoriNama],
      },
    });
  }
  console.log("✅ Barang Habis Pakai selesai");

  // Aset Tetap
  const asetData = [
    { kodeBarang: "AST-COMP-001", nama: "Laptop Dell Latitude 3540",    satuan: "unit", hargaSatuan: 12500000, kategoriNama: "Komputer & Laptop" },
    { kodeBarang: "AST-COMP-002", nama: "Laptop Lenovo ThinkPad E14",   satuan: "unit", hargaSatuan: 11000000, kategoriNama: "Komputer & Laptop" },
    { kodeBarang: "AST-PRNT-001", nama: "Printer Epson L3250",          satuan: "unit", hargaSatuan: 2800000,  kategoriNama: "Printer & Scanner" },
    { kodeBarang: "AST-KEND-001", nama: "Kendaraan Roda 4 Toyota Avanza", satuan: "unit", hargaSatuan: 210000000, kategoriNama: "Kendaraan Roda 4" },
    { kodeBarang: "AST-KEND-002", nama: "Kendaraan Roda 2 Honda Vario", satuan: "unit", hargaSatuan: 22000000, kategoriNama: "Kendaraan Roda 2" },
    { kodeBarang: "AST-PROJ-001", nama: "Proyektor Epson EB-E01",       satuan: "unit", hargaSatuan: 4500000,  kategoriNama: "Peralatan Audio Visual" },
  ];

  for (const a of asetData) {
    await prisma.barang.upsert({
      where: { kodeBarang: a.kodeBarang },
      update: {},
      create: {
        kodeBarang: a.kodeBarang,
        nama: a.nama,
        satuan: a.satuan,
        jenisBarang: JenisBarang.ASET_TETAP,
        hargaSatuan: a.hargaSatuan,
        kategoriId: kategoriMap[a.kategoriNama],
      },
    });
  }
  console.log("✅ Barang Aset Tetap selesai");

  // ── Unit Aset ────────────────────────────────────────────
  const laptopDell = await prisma.barang.findUnique({ where: { kodeBarang: "AST-COMP-001" } });
  const laptopLenovo = await prisma.barang.findUnique({ where: { kodeBarang: "AST-COMP-002" } });
  const printer = await prisma.barang.findUnique({ where: { kodeBarang: "AST-PRNT-001" } });
  const mobil = await prisma.barang.findUnique({ where: { kodeBarang: "AST-KEND-001" } });
  const motor = await prisma.barang.findUnique({ where: { kodeBarang: "AST-KEND-002" } });
  const proyektor = await prisma.barang.findUnique({ where: { kodeBarang: "AST-PROJ-001" } });
  const bidang01 = await prisma.bidang.findUnique({ where: { kode: "BID-01" } });
  const bidang02 = await prisma.bidang.findUnique({ where: { kode: "BID-02" } });

  const unitAsetData = [
    { barangId: laptopDell!.id,   nomorSeri: "DELL-LAT-2024-001", nomorInventaris: "INV-LAPTOP-001", qrCode: "QR-LAPTOP-001", tahunPerolehan: 2024, nilaiPerolehan: 12500000, kondisi: KondisiBarang.BAIK,         bidangId: bidang01!.id },
    { barangId: laptopDell!.id,   nomorSeri: "DELL-LAT-2024-002", nomorInventaris: "INV-LAPTOP-002", qrCode: "QR-LAPTOP-002", tahunPerolehan: 2024, nilaiPerolehan: 12500000, kondisi: KondisiBarang.BAIK,         bidangId: bidang02!.id },
    { barangId: laptopLenovo!.id, nomorSeri: "LNVO-E14-2023-001", nomorInventaris: "INV-LAPTOP-003", qrCode: "QR-LAPTOP-003", tahunPerolehan: 2023, nilaiPerolehan: 11000000, kondisi: KondisiBarang.RUSAK_RINGAN, bidangId: bidang01!.id },
    { barangId: printer!.id,      nomorSeri: "EPS-L3250-2023-01", nomorInventaris: "INV-PRNT-001",   qrCode: "QR-PRNT-001",   tahunPerolehan: 2023, nilaiPerolehan: 2800000,  kondisi: KondisiBarang.BAIK,         bidangId: bidang01!.id },
    { barangId: mobil!.id,        nomorSeri: "B-1234-XY",         nomorInventaris: "INV-KEND-001",   qrCode: "QR-KEND-001",   tahunPerolehan: 2022, nilaiPerolehan: 210000000,kondisi: KondisiBarang.BAIK,         bidangId: bidang01!.id },
    { barangId: motor!.id,        nomorSeri: "B-5678-ZZ",         nomorInventaris: "INV-KEND-002",   qrCode: "QR-KEND-002",   tahunPerolehan: 2023, nilaiPerolehan: 22000000, kondisi: KondisiBarang.BAIK,         bidangId: bidang02!.id },
    { barangId: proyektor!.id,    nomorSeri: "EPS-EB-2024-001",   nomorInventaris: "INV-PROJ-001",   qrCode: "QR-PROJ-001",   tahunPerolehan: 2024, nilaiPerolehan: 4500000,  kondisi: KondisiBarang.BAIK,         bidangId: bidang01!.id },
  ];

  for (const u of unitAsetData) {
    await prisma.unitAset.upsert({
      where: { nomorInventaris: u.nomorInventaris },
      update: {},
      create: u,
    });
  }
  console.log("✅ Unit Aset selesai");

  // ── Users ────────────────────────────────────────────────
  const hashedPassword = await bcrypt.hash("password123", 10);
  const bidangSekretariat = await prisma.bidang.findUnique({ where: { kode: "BID-01" } });
  const bidangPerencanaan = await prisma.bidang.findUnique({ where: { kode: "BID-02" } });

  const usersData = [
    {
      name: "Ahmad Fauzi, S.E.",
      nip: "197801012005011001",
      email: "admin@simapo.go.id",
      password: hashedPassword,
      role: Role.ADMIN_GUDANG,
      bidangId: bidangSekretariat!.id,
    },
    {
      name: "Drs. Bambang Supriyanto, M.M.",
      nip: "196901012000011001",
      email: "kadis@simapo.go.id",
      password: hashedPassword,
      role: Role.EKSEKUTIF,
      bidangId: null,
    },
    {
      name: "Dewi Rahayu, S.Kom.",
      nip: "199203152015042001",
      email: "dewi@simapo.go.id",
      password: hashedPassword,
      role: Role.PEGAWAI,
      bidangId: bidangPerencanaan!.id,
    },
    {
      name: "Hendra Gunawan",
      nip: "199005202018011002",
      email: "hendra@simapo.go.id",
      password: hashedPassword,
      role: Role.PEGAWAI,
      bidangId: bidangSekretariat!.id,
    },
  ];

  for (const u of usersData) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: u,
    });
  }
  console.log("✅ Users selesai");

  console.log("\n🎉 Seed database selesai!");
  console.log("─────────────────────────────────────────");
  console.log("Akun Login:");
  console.log("  Admin     : admin@simapo.go.id  / password123");
  console.log("  Kepala Dinas: kadis@simapo.go.id  / password123");
  console.log("  Pegawai   : dewi@simapo.go.id   / password123");
  console.log("─────────────────────────────────────────");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
