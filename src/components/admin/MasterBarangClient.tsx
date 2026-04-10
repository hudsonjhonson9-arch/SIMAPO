// src/components/admin/MasterBarangClient.tsx
"use client";

import { useState, useTransition } from "react";
import {
  Plus, Search, Pencil, Trash2, PackageX, AlertTriangle,
  Filter, ChevronDown, Package, Layers,
} from "lucide-react";
import { createBarang, updateBarang, deleteBarang } from "@/actions/barang.actions";
import { formatRupiah, jenisBarangLabel, cn } from "@/lib/utils";
import type { Barang, KategoriBarang } from "@prisma/client";

type BarangWithKategori = Barang & { kategori: KategoriBarang | null };

interface Props {
  initialData: BarangWithKategori[];
  kategoriList: KategoriBarang[];
}

const SATUAN_OPTIONS = ["pcs", "rim", "box", "botol", "pack", "lembar", "buah", "unit", "liter", "kg", "meter", "lusin"];

export function MasterBarangClient({ initialData, kategoriList }: Props) {
  const [data, setData] = useState(initialData);
  const [search, setSearch] = useState("");
  const [filterJenis, setFilterJenis] = useState<string>("ALL");
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<BarangWithKategori | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string>("");

  const filtered = data.filter((b) => {
    const matchSearch =
      b.nama.toLowerCase().includes(search.toLowerCase()) ||
      b.kodeBarang.toLowerCase().includes(search.toLowerCase());
    const matchJenis = filterJenis === "ALL" || b.jenisBarang === filterJenis;
    return matchSearch && matchJenis;
  });

  const lowStock = data.filter(
    (b) => b.jenisBarang === "HABIS_PAKAI" && b.stokSaatIni <= b.minimumStok
  );

  function handleEdit(item: BarangWithKategori) {
    setEditItem(item);
    setShowForm(true);
    setFormError("");
  }

  function handleDelete(id: string) {
    setDeleteId(id);
  }

  async function handleFormSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError("");
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = editItem
        ? await updateBarang(editItem.id, formData)
        : await createBarang(formData);

      if (result.success) {
        // Refresh: re-fetch from server by reloading
        window.location.reload();
      } else {
        setFormError(
          typeof result.error === "string"
            ? result.error
            : "Terdapat kesalahan pada form"
        );
      }
    });
  }

  async function handleConfirmDelete() {
    if (!deleteId) return;
    startTransition(async () => {
      await deleteBarang(deleteId);
      setDeleteId(null);
      window.location.reload();
    });
  }

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Low stock warning */}
      {lowStock.length > 0 && (
        <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-amber-800 text-sm">
              Peringatan Stok Menipis ({lowStock.length} item)
            </p>
            <p className="text-xs text-amber-700 mt-0.5">
              {lowStock.map((b) => b.nama).join(", ")}
            </p>
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex gap-2 flex-1">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Cari nama atau kode barang..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
            />
          </div>
          <div className="relative">
            <select
              value={filterJenis}
              onChange={(e) => setFilterJenis(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2 text-sm border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer"
            >
              <option value="ALL">Semua Jenis</option>
              <option value="HABIS_PAKAI">Habis Pakai</option>
              <option value="ASET_TETAP">Aset Tetap</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground pointer-events-none" />
          </div>
        </div>
        <button
          onClick={() => { setEditItem(null); setShowForm(true); setFormError(""); }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Tambah Barang
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Barang",    value: data.length,                               color: "text-blue-600",   bg: "bg-blue-50"  },
          { label: "Habis Pakai",     value: data.filter(b => b.jenisBarang === "HABIS_PAKAI").length, color: "text-green-600", bg: "bg-green-50" },
          { label: "Aset Tetap",      value: data.filter(b => b.jenisBarang === "ASET_TETAP").length,  color: "text-purple-600",bg: "bg-purple-50"},
          { label: "Stok Menipis",    value: lowStock.length,                            color: "text-amber-600",  bg: "bg-amber-50" },
        ].map((s) => (
          <div key={s.label} className={`${s.bg} rounded-xl p-3 border border-current/10`}>
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="table-container">
        <div className="scroll-shadow-indicator" />
        <div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Kode</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Nama Barang</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Jenis</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Satuan</th>
                <th className="text-right px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Stok</th>
                <th className="text-right px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Harga Satuan</th>
                <th className="text-center px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-muted-foreground">
                    <PackageX className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    <p>Tidak ada data barang</p>
                  </td>
                </tr>
              ) : (
                filtered.map((item) => {
                  const isLow = item.jenisBarang === "HABIS_PAKAI" && item.stokSaatIni <= item.minimumStok;
                  return (
                    <tr key={item.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3">
                        <code className="text-xs bg-muted px-2 py-0.5 rounded font-mono">{item.kodeBarang}</code>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-foreground">{item.nama}</p>
                        {item.kodeRekening && (
                          <p className="text-xs text-muted-foreground">{item.kodeRekening}</p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn(
                          "badge-status",
                          item.jenisBarang === "HABIS_PAKAI"
                            ? "bg-green-100 text-green-700"
                            : "bg-purple-100 text-purple-700"
                        )}>
                          {jenisBarangLabel[item.jenisBarang]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{item.satuan}</td>
                      <td className="px-4 py-3 text-right">
                        {item.jenisBarang === "HABIS_PAKAI" ? (
                          <div className={cn(
                            "font-semibold",
                            isLow ? "text-amber-600" : "text-foreground"
                          )}>
                            {item.stokSaatIni}
                            {isLow && <AlertTriangle className="w-3 h-3 inline ml-1 text-amber-500" />}
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-xs">Per Unit</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right font-medium">
                        {formatRupiah(Number(item.hargaSatuan))}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleEdit(item)}
                            className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500 transition-colors"
                            title="Edit"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
                            title="Hapus"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-card rounded-2xl border shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-fade-in">
            <div className="sticky top-0 bg-card border-b px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <div>
                <h2 className="font-bold text-foreground">
                  {editItem ? "Edit Barang" : "Tambah Barang Baru"}
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {editItem ? `Mengubah: ${editItem.nama}` : "Isi form di bawah dengan lengkap"}
                </p>
              </div>
              <button
                onClick={() => setShowForm(false)}
                className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center transition-colors text-muted-foreground"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Kode Barang *</label>
                  <input
                    name="kodeBarang"
                    defaultValue={editItem?.kodeBarang}
                    placeholder="ATK-0001"
                    required
                    className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-background"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Kode Rekening SIPD</label>
                  <input
                    name="kodeRekening"
                    defaultValue={editItem?.kodeRekening ?? ""}
                    placeholder="5.2.2.01.01.0001"
                    className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-background"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Nama Barang *</label>
                <input
                  name="nama"
                  defaultValue={editItem?.nama}
                  placeholder="Kertas HVS A4 80gr"
                  required
                  className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-background"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Jenis Barang *</label>
                  <select
                    name="jenisBarang"
                    defaultValue={editItem?.jenisBarang ?? "HABIS_PAKAI"}
                    className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-background"
                  >
                    <option value="HABIS_PAKAI">Habis Pakai / ATK</option>
                    <option value="ASET_TETAP">Aset Tetap</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Satuan *</label>
                  <select
                    name="satuan"
                    defaultValue={editItem?.satuan ?? "pcs"}
                    className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-background"
                  >
                    {SATUAN_OPTIONS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Kategori</label>
                <select
                  name="kategoriId"
                  defaultValue={editItem?.kategoriId ?? ""}
                  className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-background"
                >
                  <option value="">— Pilih Kategori —</option>
                  {kategoriList.map((k) => (
                    <option key={k.id} value={k.id}>{k.nama}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Stok Awal</label>
                  <input
                    name="stokSaatIni"
                    type="number"
                    min="0"
                    defaultValue={editItem?.stokSaatIni ?? 0}
                    className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-background"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Min. Stok</label>
                  <input
                    name="minimumStok"
                    type="number"
                    min="0"
                    defaultValue={editItem?.minimumStok ?? 0}
                    className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-background"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Harga Satuan (Rp)</label>
                  <input
                    name="hargaSatuan"
                    type="number"
                    min="0"
                    defaultValue={Number(editItem?.hargaSatuan) ?? 0}
                    className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-background"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Spesifikasi</label>
                <textarea
                  name="spesifikasi"
                  defaultValue={editItem?.spesifikasi ?? ""}
                  placeholder="Deskripsi spesifikasi teknis barang..."
                  rows={2}
                  className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-background resize-none"
                />
              </div>

              {formError && (
                <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-2.5 text-sm text-red-700">
                  {formError}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 px-4 py-2.5 text-sm font-medium border rounded-lg hover:bg-muted transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 px-4 py-2.5 text-sm font-semibold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-60"
                >
                  {isPending ? "Menyimpan..." : editItem ? "Simpan Perubahan" : "Tambah Barang"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-card rounded-2xl border shadow-2xl p-6 max-w-sm w-full animate-fade-in text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="font-bold text-foreground mb-1">Hapus Barang?</h3>
            <p className="text-sm text-muted-foreground mb-5">
              Data barang akan dinonaktifkan. Tindakan ini dapat dibatalkan oleh admin database.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 px-4 py-2 text-sm font-medium border rounded-lg hover:bg-muted transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isPending}
                className="flex-1 px-4 py-2 text-sm font-semibold bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-60"
              >
                {isPending ? "Menghapus..." : "Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
