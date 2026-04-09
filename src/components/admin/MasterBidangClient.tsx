// src/components/admin/MasterBidangClient.tsx
"use client";

import { useState, useTransition } from "react";
import { Plus, Pencil, Trash2, Building2, Users, Package } from "lucide-react";
import { createBidang, updateBidang, deleteBidang } from "@/actions/bidang.actions";
import type { Bidang } from "@prisma/client";

type BidangWithCount = Bidang & {
  _count: { users: number; unitAset: number };
};

interface Props {
  initialData: BidangWithCount[];
}

export function MasterBidangClient({ initialData }: Props) {
  const [data] = useState(initialData);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<BidangWithCount | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError("");
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = editItem
        ? await updateBidang(editItem.id, formData)
        : await createBidang(formData);

      if (result.success) {
        window.location.reload();
      } else {
        setFormError(
          typeof result.error === "string" ? result.error : "Terdapat kesalahan pada form"
        );
      }
    });
  }

  async function handleDelete() {
    if (!deleteId) return;
    startTransition(async () => {
      await deleteBidang(deleteId);
      setDeleteId(null);
      window.location.reload();
    });
  }

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {data.length} bidang / unit kerja terdaftar
        </p>
        <button
          onClick={() => { setEditItem(null); setShowForm(true); setFormError(""); }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Tambah Bidang
        </button>
      </div>

      {/* Grid cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.map((item, idx) => (
          <div
            key={item.id}
            className="bg-card rounded-xl border shadow-sm p-5 hover:shadow-md transition-shadow animate-fade-in"
            style={{ animationDelay: `${idx * 0.05}s` }}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-primary" />
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => { setEditItem(item); setShowForm(true); setFormError(""); }}
                  className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500 transition-colors"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setDeleteId(item.id)}
                  className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div>
              <span className="inline-block text-xs font-mono bg-muted px-2 py-0.5 rounded text-muted-foreground mb-1">
                {item.kode}
              </span>
              <h3 className="font-semibold text-foreground text-sm leading-tight">{item.nama}</h3>
              {item.deskripsi && (
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{item.deskripsi}</p>
              )}
            </div>

            <div className="flex gap-4 mt-4 pt-3 border-t">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Users className="w-3.5 h-3.5" />
                <span>{item._count.users} pegawai</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Package className="w-3.5 h-3.5" />
                <span>{item._count.unitAset} aset</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-card rounded-2xl border shadow-2xl w-full max-w-md animate-fade-in">
            <div className="border-b px-6 py-4 flex items-center justify-between">
              <h2 className="font-bold text-foreground">
                {editItem ? "Edit Bidang" : "Tambah Bidang Baru"}
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Kode Bidang *</label>
                <input
                  name="kode"
                  defaultValue={editItem?.kode}
                  placeholder="BID-01"
                  required
                  className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-background"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Nama Bidang *</label>
                <input
                  name="nama"
                  defaultValue={editItem?.nama}
                  placeholder="Bidang Perencanaan"
                  required
                  className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-background"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Deskripsi</label>
                <textarea
                  name="deskripsi"
                  defaultValue={editItem?.deskripsi ?? ""}
                  placeholder="Deskripsi singkat tugas dan fungsi bidang..."
                  rows={3}
                  className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-background resize-none"
                />
              </div>

              {formError && (
                <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-2 text-sm text-red-700">
                  {formError}
                </div>
              )}

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 px-4 py-2.5 text-sm font-medium border rounded-lg hover:bg-muted transition-colors">
                  Batal
                </button>
                <button type="submit" disabled={isPending} className="flex-1 px-4 py-2.5 text-sm font-semibold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-60">
                  {isPending ? "Menyimpan..." : editItem ? "Simpan" : "Tambah"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-card rounded-2xl border shadow-2xl p-6 max-w-sm w-full text-center animate-fade-in">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="font-bold text-foreground mb-1">Hapus Bidang?</h3>
            <p className="text-sm text-muted-foreground mb-5">Bidang akan dinonaktifkan dari sistem.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 px-4 py-2 text-sm font-medium border rounded-lg hover:bg-muted">Batal</button>
              <button onClick={handleDelete} disabled={isPending} className="flex-1 px-4 py-2 text-sm font-semibold bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-60">
                {isPending ? "Menghapus..." : "Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
