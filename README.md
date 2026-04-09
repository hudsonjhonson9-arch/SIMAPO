# SIMAPO — Sistem Manajemen Aset & Persediaan Operasional

Sistem manajemen aset dan persediaan operasional instansi pemerintah, pelengkap sistem SIPD.

---

## 🚀 Cara Menjalankan

### 1. Prasyarat
- Node.js 18+
- PostgreSQL (lokal atau Supabase/Neon)
- Git

### 2. Install & Konfigurasi

```bash
# Clone / ekstrak project
cd simapo

# Install dependencies
npm install

# Salin file environment
cp .env.example .env
```

Edit `.env` dan isi `DATABASE_URL` dengan koneksi PostgreSQL Anda:
```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/simapo_db"
AUTH_SECRET="buat-secret-random-min-32-karakter"
NEXTAUTH_URL="http://localhost:3000"
```

### 3. Setup Database

```bash
# Generate Prisma client
npm run db:generate

# Jalankan migrasi
npm run db:migrate

# Isi data awal
npm run db:seed
```

### 4. Jalankan Development Server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000)

---

## 🔐 Akun Login (Seed)

| Role           | Email                    | Password     |
|----------------|--------------------------|--------------|
| Admin Gudang   | admin@simapo.go.id       | password123  |
| Kepala Dinas   | kadis@simapo.go.id       | password123  |
| Pegawai        | dewi@simapo.go.id        | password123  |
| Pegawai 2      | hendra@simapo.go.id      | password123  |

---

## 📦 Tech Stack

| Layer        | Teknologi                              |
|--------------|----------------------------------------|
| Framework    | Next.js 15 (App Router)                |
| Styling      | Tailwind CSS + shadcn/ui               |
| Auth         | NextAuth v5 (Auth.js) + bcryptjs       |
| ORM          | Prisma 5                               |
| Database     | PostgreSQL                             |
| Charts       | Recharts                               |
| Deployment   | Vercel                                 |

---

## 🌟 Modul yang Tersedia

| No | Modul                          | Status     |
|----|--------------------------------|------------|
| 1  | Autentikasi & RBAC (3 role)    | ✅ Lengkap  |
| 2  | Master Barang & Master Bidang  | ✅ Lengkap  |
| 3  | Request ATK + Cart + Approval  | ✅ Lengkap  |
| 4  | Peminjaman Aset (Booking)      | ✅ Lengkap  |
| 5  | Helpdesk & Ticketing           | ✅ Lengkap  |
| 6  | Stock Opname                   | ✅ Lengkap  |
| 7  | Laporan & Export CSV SIPD-Ready| ✅ Lengkap  |
| 8  | Dashboard Eksekutif + Charts   | ✅ Lengkap  |

---

## 🗂️ Struktur Folder

```
src/
├── app/
│   ├── (auth)/login/           # Halaman login
│   ├── (dashboard)/
│   │   ├── admin/              # Route group Admin Gudang
│   │   │   ├── master-barang/
│   │   │   ├── master-bidang/
│   │   │   ├── barang-masuk/
│   │   │   ├── approval/
│   │   │   ├── peminjaman/
│   │   │   ├── helpdesk/
│   │   │   ├── stock-opname/
│   │   │   ├── laporan/
│   │   │   └── pengguna/
│   │   ├── pegawai/            # Route group Pegawai
│   │   │   ├── request-atk/
│   │   │   ├── peminjaman/
│   │   │   └── helpdesk/
│   │   └── eksekutif/          # Route group Kepala Dinas
│   │       ├── dashboard/
│   │       └── laporan/
│   └── api/                    # REST API routes
├── actions/                    # Server Actions (Next.js)
├── components/
│   ├── admin/                  # Komponen khusus admin
│   ├── pegawai/                # Komponen khusus pegawai
│   ├── eksekutif/              # Komponen khusus eksekutif
│   ├── shared/                 # Sidebar, Header
│   └── ui/                     # shadcn/ui base components
├── lib/
│   ├── auth.ts                 # NextAuth config
│   ├── db.ts                   # Prisma client singleton
│   └── utils.ts                # Helper functions
├── types/
│   └── next-auth.d.ts          # Type augmentation
└── middleware.ts               # Route protection & RBAC
```

---

## 🚢 Deploy ke Vercel

1. Push ke GitHub
2. Import project di Vercel
3. Set environment variables:
   - `DATABASE_URL` (gunakan Supabase atau Neon untuk Postgres)
   - `AUTH_SECRET`
   - `NEXTAUTH_URL` (URL produksi Vercel)
4. Vercel auto-deploy setiap push ke `main`

Untuk database production, gunakan **[Neon](https://neon.tech)** atau **[Supabase](https://supabase.com)** (gratis tier tersedia).

---

## 📋 Perintah NPM

```bash
npm run dev          # Development server
npm run build        # Build production
npm run db:generate  # Generate Prisma client
npm run db:migrate   # Jalankan migrasi database
npm run db:seed      # Isi data awal
npm run db:studio    # Buka Prisma Studio (GUI database)
```

---

## 🔧 Pengembangan Lanjutan

Modul yang bisa ditambahkan:
- **QR Code Generator** untuk label aset (menggunakan `qrcode` package)
- **Upload Foto** tiket kerusakan (menggunakan Supabase Storage / Uploadthing)
- **Auto BAST PDF** (menggunakan `jsPDF` atau `@react-pdf/renderer`)
- **Vercel Cron Jobs** untuk reminder jadwal maintenance
- **Notifikasi Real-time** (menggunakan Supabase Realtime)

---

*Dikembangkan untuk mendukung pengelolaan aset instansi pemerintah sesuai standar SIPD Kemendagri.*
