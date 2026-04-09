// src/components/admin/PenggunaClient.tsx
"use client";

import { useState, useTransition } from "react";
import { Plus, Pencil, UserCheck, UserX, Shield, User, Crown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Bidang, User as UserType } from "@prisma/client";

type UserWithBidang = UserType & { bidang: Pick<Bidang, "nama" | "kode"> | null };

interface Props {
  users: UserWithBidang[];
  bidangList: Bidang[];
}

const ROLE_INFO: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  PEGAWAI:      { label: "Pegawai",      color: "bg-gray-100 text-gray-700",    icon: <User className="w-3 h-3" />    },
  ADMIN_GUDANG: { label: "Admin Gudang", color: "bg-blue-100 text-blue-700",    icon: <Shield className="w-3 h-3" />  },
  EKSEKUTIF:    { label: "Kepala Dinas", color: "bg-purple-100 text-purple-700", icon: <Crown className="w-3 h-3" /> },
};

export function PenggunaClient({ users, bidangList }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<UserWithBidang | null>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const fd = new FormData(e.currentTarget);
    const body = {
      id: editItem?.id,
      name: fd.get("name"),
      nip: fd.get("nip"),
      email: fd.get("email"),
      password: fd.get("password"),
      role: fd.get("role"),
      bidangId: fd.get("bidangId") || null,
    };

    startTransition(async () => {
      const res = await fetch("/api/users", {
        method: editItem ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) {
        setShowForm(false);
        setEditItem(null);
        window.location.reload();
      } else {
        setError(data.error ?? "Gagal menyimpan");
      }
    });
  }

  async function toggleActive(id: string, isActive: boolean) {
    startTransition(async () => {
      await fetch("/api/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isActive: !isActive }),
      });
      window.location.reload();
    });
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{users.length} pengguna terdaftar</p>
        <button
          onClick={() => { setEditItem(null); setShowForm(true); setError(""); }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Tambah Pengguna
        </button>
      </div>

      {/* Stats by role */}
      <div className="grid grid-cols-3 gap-3">
        {Object.entries(ROLE_INFO).map(([role, info]) => (
          <div key={role} className="bg-card rounded-xl border p-4 flex items-center gap-3">
            <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", info.color.replace("text-", "bg-").replace("700", "100"))}>
              {info.icon}
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{info.label}</p>
              <p className="font-bold text-lg">{users.filter(u => u.role === role).length}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                {["Nama / NIP", "Email", "Role", "Bidang", "Status", "Aksi"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {users.map((u) => {
                const roleInfo = ROLE_INFO[u.role];
                return (
                  <tr key={u.id} className={cn("hover:bg-muted/20 transition-colors", !u.isActive && "opacity-50")}>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-foreground">{u.name}</p>
                      {u.nip && <p className="text-xs text-muted-foreground font-mono">{u.nip}</p>}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-sm">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className={cn("badge-status inline-flex items-center gap-1", roleInfo.color)}>
                        {roleInfo.icon}
                        {roleInfo.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {u.bidang ? `${u.bidang.kode} — ${u.bidang.nama}` : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn("badge-status", u.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700")}>
                        {u.isActive ? "Aktif" : "Nonaktif"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => { setEditItem(u); setShowForm(true); setError(""); }}
                          className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500 transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => toggleActive(u.id, u.isActive)}
                          disabled={isPending}
                          className={cn(
                            "p-1.5 rounded-lg transition-colors",
                            u.isActive
                              ? "hover:bg-red-50 text-red-400"
                              : "hover:bg-green-50 text-green-500"
                          )}
                        >
                          {u.isActive ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-card rounded-2xl border shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-fade-in">
            <div className="sticky top-0 bg-card border-b px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <h2 className="font-bold text-foreground">{editItem ? "Edit Pengguna" : "Tambah Pengguna Baru"}</h2>
              <button onClick={() => setShowForm(false)} className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Nama Lengkap *</label>
                <input name="name" defaultValue={editItem?.name} required placeholder="Nama lengkap dengan gelar"
                  className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">NIP</label>
                  <input name="nip" defaultValue={editItem?.nip ?? ""} placeholder="18 digit NIP"
                    className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Role *</label>
                  <select name="role" defaultValue={editItem?.role ?? "PEGAWAI"}
                    className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background">
                    <option value="PEGAWAI">Pegawai</option>
                    <option value="ADMIN_GUDANG">Admin Gudang</option>
                    <option value="EKSEKUTIF">Kepala Dinas</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Email *</label>
                <input name="email" type="email" defaultValue={editItem?.email} required placeholder="email@instansi.go.id"
                  className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Password {editItem && <span className="text-muted-foreground font-normal">(kosongkan jika tidak ingin ubah)</span>}
                </label>
                <input name="password" type="password" placeholder={editItem ? "••••••••" : "Min. 6 karakter"}
                  className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Bidang / Unit Kerja</label>
                <select name="bidangId" defaultValue={editItem?.bidangId ?? ""}
                  className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background">
                  <option value="">— Tidak ada —</option>
                  {bidangList.map((b) => <option key={b.id} value={b.id}>{b.kode} — {b.nama}</option>)}
                </select>
              </div>
              {error && <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 px-4 py-2.5 text-sm font-medium border rounded-lg hover:bg-muted">Batal</button>
                <button type="submit" disabled={isPending} className="flex-1 px-4 py-2.5 text-sm font-semibold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-60">
                  {isPending ? "Menyimpan..." : editItem ? "Simpan" : "Tambah"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
