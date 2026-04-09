// src/lib/utils.ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRupiah(amount: number | string | null | undefined): string {
  const num = typeof amount === "string" ? parseFloat(amount) : (amount ?? 0);
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}

export function formatTanggal(date: Date | string | null | undefined): string {
  if (!date) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

export function formatTanggalPendek(date: Date | string | null | undefined): string {
  if (!date) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date));
}

export function generateNomorRequest(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const rand = Math.floor(Math.random() * 9000) + 1000;
  return `REQ-${year}${month}-${rand}`;
}

export function generateNomorPeminjaman(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const rand = Math.floor(Math.random() * 9000) + 1000;
  return `PJM-${year}${month}-${rand}`;
}

export function generateNomorTiket(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const rand = Math.floor(Math.random() * 9000) + 1000;
  return `TKT-${year}${month}-${rand}`;
}

export function generateNomorOpname(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `OPN-${year}${month}-${String(now.getDate()).padStart(2, "0")}`;
}

export const statusRequestLabel: Record<string, { label: string; color: string }> = {
  MENUNGGU:   { label: "Menunggu",   color: "bg-yellow-100 text-yellow-800" },
  DISETUJUI:  { label: "Disetujui",  color: "bg-green-100 text-green-800"  },
  DITOLAK:    { label: "Ditolak",    color: "bg-red-100 text-red-800"     },
  DISERAHKAN: { label: "Diserahkan", color: "bg-blue-100 text-blue-800"   },
};

export const kondisiLabel: Record<string, { label: string; color: string }> = {
  BAIK:         { label: "Baik",         color: "bg-green-100 text-green-800"  },
  RUSAK_RINGAN: { label: "Rusak Ringan", color: "bg-yellow-100 text-yellow-800"},
  RUSAK_BERAT:  { label: "Rusak Berat",  color: "bg-red-100 text-red-800"    },
  HILANG:       { label: "Hilang",       color: "bg-gray-100 text-gray-800"  },
};

export const jenisBarangLabel: Record<string, string> = {
  HABIS_PAKAI: "Habis Pakai",
  ASET_TETAP:  "Aset Tetap",
};
