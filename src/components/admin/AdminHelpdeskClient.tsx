// src/components/admin/AdminHelpdeskClient.tsx
"use client";

import { useState, useTransition } from "react";
import { Wrench, ArrowRight } from "lucide-react";
import { formatTanggal, cn } from "@/lib/utils";

type TiketItem = {
  id: string;
  nomorTiket: string;
  judul: string;
  deskripsi: string;
  status: string;
  prioritas: string;
  lokasi: string | null;
  catatanAdmin: string | null;
  createdAt: Date;
  user: { name: string; bidang: { nama: string } | null };
};

interface Props { tiket: TiketItem[] }

const STATUS_FLOW = ["MENUNGGU_PENGECEKAN", "PROSES_SERVIS", "SELESAI"];
const STATUS_LABEL: Record<string, string> = {
  MENUNGGU_PENGECEKAN: "Menunggu",
  PROSES_SERVIS: "Proses Servis",
  SELESAI: "Selesai",
  DITOLAK: "Ditolak",
};
const STATUS_COLOR: Record<string, string> = {
  MENUNGGU_PENGECEKAN: "bg-amber-100 text-amber-700",
  PROSES_SERVIS:       "bg-blue-100 text-blue-700",
  SELESAI:             "bg-green-100 text-green-700",
  DITOLAK:             "bg-red-100 text-red-700",
};
const PRIORITAS_COLOR: Record<string, string> = {
  LOW: "bg-gray-100 text-gray-600", NORMAL: "bg-blue-50 text-blue-600",
  HIGH: "bg-orange-100 text-orange-700", CRITICAL: "bg-red-100 text-red-700",
};

export function AdminHelpdeskClient({ tiket }: Props) {
  const [selected, setSelected] = useState<TiketItem | null>(null);
  const [catatan, setCatatan] = useState("");
  const [isPending, startTransition] = useTransition();

  async function updateTiket(id: string, status: string) {
    startTransition(async () => {
      await fetch("/api/tiket/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status, catatanAdmin: catatan }),
      });
      setSelected(null);
      setCatatan("");
      window.location.reload();
    });
  }

  const aktif = tiket.filter((t) => t.status !== "SELESAI" && t.status !== "DITOLAK");
  const selesai = tiket.filter((t) => t.status === "SELESAI" || t.status === "DITOLAK");

  return (
    <div className="space-y-6 animate-fade-in">
      {aktif.length > 0 && (
        <section>
          <h3 className="text-sm font-semibold text-foreground mb-3">Tiket Aktif ({aktif.length})</h3>
          <div className="space-y-2">
            {aktif.map((t) => (
              <div key={t.id} className="bg-card rounded-xl border p-4 hover:shadow-sm transition-shadow">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <code className="text-xs bg-muted px-2 py-0.5 rounded font-mono">{t.nomorTiket}</code>
                      <span className={cn("badge-status", STATUS_COLOR[t.status])}>{STATUS_LABEL[t.status]}</span>
                      <span className={cn("badge-status", PRIORITAS_COLOR[t.prioritas])}>{t.prioritas}</span>
                    </div>
                    <p className="font-semibold text-sm text-foreground">{t.judul}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{t.deskripsi}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {t.user.name} · {t.user.bidang?.nama ?? "-"} · {formatTanggal(t.createdAt)}
                      {t.lokasi && ` · 📍 ${t.lokasi}`}
                    </p>
                  </div>
                  <button
                    onClick={() => { setSelected(t); setCatatan(t.catatanAdmin ?? ""); }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors flex-shrink-0"
                  >
                    Update Status <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {selesai.length > 0 && (
        <section>
          <h3 className="text-sm font-semibold text-muted-foreground mb-3">Selesai / Ditolak ({selesai.length})</h3>
          <div className="space-y-2">
            {selesai.slice(0, 10).map((t) => (
              <div key={t.id} className="bg-muted/30 rounded-xl border p-3.5">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">{t.nomorTiket}</code>
                      <span className={cn("badge-status", STATUS_COLOR[t.status])}>{STATUS_LABEL[t.status]}</span>
                    </div>
                    <p className="text-sm font-medium text-foreground">{t.judul}</p>
                    <p className="text-xs text-muted-foreground">{t.user.name} · {formatTanggal(t.createdAt)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Update status modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-card rounded-2xl border shadow-2xl w-full max-w-sm animate-fade-in">
            <div className="border-b px-6 py-4 flex items-center gap-3">
              <Wrench className="w-5 h-5 text-primary" />
              <div>
                <h3 className="font-bold text-sm">Update Tiket</h3>
                <p className="text-xs text-muted-foreground">{selected.nomorTiket}</p>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Status Saat Ini</p>
                <span className={cn("badge-status", STATUS_COLOR[selected.status])}>{STATUS_LABEL[selected.status]}</span>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Catatan Admin</label>
                <textarea value={catatan} onChange={(e) => setCatatan(e.target.value)} rows={2}
                  className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background resize-none"
                  placeholder="Catatan tindakan yang diambil..." />
              </div>
              <div className="grid grid-cols-2 gap-2">
                {STATUS_FLOW.filter((s) => s !== selected.status).map((s) => (
                  <button key={s} onClick={() => updateTiket(selected.id, s)} disabled={isPending}
                    className={cn("px-3 py-2 text-xs font-semibold rounded-lg border transition-colors disabled:opacity-60",
                      s === "SELESAI" ? "bg-green-500 text-white hover:bg-green-600 border-transparent" :
                      "bg-background hover:bg-muted"
                    )}>
                    → {STATUS_LABEL[s]}
                  </button>
                ))}
                <button onClick={() => updateTiket(selected.id, "DITOLAK")} disabled={isPending}
                  className="px-3 py-2 text-xs font-semibold rounded-lg border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-60">
                  Tolak
                </button>
              </div>
              <button onClick={() => setSelected(null)} className="w-full py-2 text-sm font-medium border rounded-lg hover:bg-muted">
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
