// src/components/admin/ApprovalClient.tsx
"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, XCircle, Clock, ChevronDown, ChevronUp } from "lucide-react";
import { approveRequest, rejectRequest } from "@/actions/request.actions";
import { formatRupiah, formatTanggal, cn } from "@/lib/utils";

type RequestItem = Awaited<ReturnType<typeof import("@/actions/request.actions").getRequestList>>[0];

interface Props {
  menunggu: RequestItem[];
  selesai: RequestItem[];
}

export function ApprovalClient({ menunggu, selesai }: Props) {
  const [activeTab, setActiveTab] = useState<"menunggu" | "selesai">("menunggu");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectNote, setRejectNote] = useState("");
  const [approveData, setApproveData] = useState<{
    requestId: string;
    items: { detailId: string; jumlahDiminta: number; jumlahDisetujui: number; nama: string }[];
    catatan: string;
  } | null>(null);
  const [isPending, startTransition] = useTransition();

  function openApprove(req: RequestItem) {
    setApproveData({
      requestId: req.id,
      catatan: "",
      items: req.detailRequest.map((d) => ({
        detailId: d.id,
        jumlahDiminta: d.jumlahDiminta,
        jumlahDisetujui: d.jumlahDiminta,
        nama: d.barang.nama,
      })),
    });
  }

  async function handleApprove() {
    if (!approveData) return;
    startTransition(async () => {
      await approveRequest(
        approveData.requestId,
        approveData.items.map((i) => ({ detailId: i.detailId, jumlahDisetujui: i.jumlahDisetujui })),
        approveData.catatan
      );
      setApproveData(null);
      window.location.reload();
    });
  }

  async function handleReject() {
    if (!rejectId) return;
    startTransition(async () => {
      await rejectRequest(rejectId, rejectNote || "Tidak sesuai kebutuhan");
      setRejectId(null);
      setRejectNote("");
      window.location.reload();
    });
  }

  const displayList = activeTab === "menunggu" ? menunggu : selesai;

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Tabs */}
      <div className="flex gap-1 bg-muted p-1 rounded-xl w-fit">
        {[
          { key: "menunggu", label: "Menunggu Approval", count: menunggu.length },
          { key: "selesai",  label: "Sudah Diproses",    count: selesai.length  },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as "menunggu" | "selesai")}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
              activeTab === tab.key
                ? "bg-card shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
            <span className={cn(
              "text-xs rounded-full px-1.5 py-0.5 font-semibold",
              activeTab === tab.key
                ? tab.key === "menunggu" ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"
                : "bg-muted-foreground/20 text-muted-foreground"
            )}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-3">
        {displayList.length === 0 ? (
          <div className="bg-card rounded-xl border p-12 text-center text-muted-foreground">
            <Clock className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">Tidak ada permintaan{activeTab === "menunggu" ? " yang menunggu" : ""}</p>
          </div>
        ) : (
          displayList.map((req) => {
            const isExpanded = expandedId === req.id;
            const totalNilai = req.detailRequest.reduce(
              (sum, d) => sum + Number(d.barang.hargaSatuan) * d.jumlahDiminta, 0
            );
            return (
              <div key={req.id} className="bg-card rounded-xl border shadow-sm overflow-hidden">
                {/* Header */}
                <div
                  className="p-4 cursor-pointer hover:bg-muted/20 transition-colors"
                  onClick={() => setExpandedId(isExpanded ? null : req.id)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <code className="text-xs bg-muted px-2 py-0.5 rounded font-mono font-semibold">
                          {req.nomorRequest}
                        </code>
                        <span className={cn(
                          "badge-status",
                          req.status === "MENUNGGU"   ? "bg-amber-100 text-amber-700" :
                          req.status === "DISETUJUI"  ? "bg-green-100 text-green-700" :
                          req.status === "DITOLAK"    ? "bg-red-100 text-red-700"    :
                          "bg-blue-100 text-blue-700"
                        )}>
                          {req.status === "MENUNGGU" ? "Menunggu" :
                           req.status === "DISETUJUI" ? "Disetujui" :
                           req.status === "DITOLAK" ? "Ditolak" : "Diserahkan"}
                        </span>
                      </div>
                      <p className="font-semibold text-sm text-foreground mt-1.5">{req.requester.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {req.bidang.nama} · {formatTanggal(req.createdAt)} · {req.detailRequest.length} item · {formatRupiah(totalNilai)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {req.status === "MENUNGGU" && (
                        <>
                          <button
                            onClick={(e) => { e.stopPropagation(); openApprove(req); }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Setujui
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); setRejectId(req.id); setRejectNote(""); }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            Tolak
                          </button>
                        </>
                      )}
                      {isExpanded
                        ? <ChevronUp className="w-4 h-4 text-muted-foreground" />
                        : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                    </div>
                  </div>
                </div>

                {/* Expanded detail */}
                {isExpanded && (
                  <div className="border-t bg-muted/20 px-4 pb-4">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mt-3 mb-2">
                      Detail Permintaan
                    </p>
                    <div className="space-y-1.5">
                      {req.detailRequest.map((d) => (
                        <div key={d.id} className="flex items-center justify-between text-sm bg-card rounded-lg px-3 py-2 border">
                          <span className="text-foreground">{d.barang.nama}</span>
                          <div className="text-right">
                            <span className="font-semibold">{d.jumlahDiminta} {d.barang.satuan}</span>
                            {d.jumlahDisetujui !== null && d.jumlahDisetujui !== d.jumlahDiminta && (
                              <span className="text-xs text-amber-600 ml-2">(disetujui: {d.jumlahDisetujui})</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    {req.catatan && (
                      <div className="mt-3 text-xs text-muted-foreground bg-card rounded-lg px-3 py-2 border">
                        <span className="font-semibold">Catatan:</span> {req.catatan}
                      </div>
                    )}
                    {req.catatanAdmin && (
                      <div className="mt-2 text-xs text-blue-700 bg-blue-50 rounded-lg px-3 py-2 border border-blue-200">
                        <span className="font-semibold">Catatan Admin:</span> {req.catatanAdmin}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Approve Modal */}
      {approveData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-card rounded-2xl border shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-fade-in">
            <div className="sticky top-0 bg-card border-b px-6 py-4 flex items-center gap-3 rounded-t-2xl">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <h2 className="font-bold text-sm">Setujui Permintaan</h2>
                <p className="text-xs text-muted-foreground">Atur jumlah yang disetujui per item</p>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="space-y-2">
                {approveData.items.map((item, idx) => (
                  <div key={item.detailId} className="flex items-center justify-between gap-4 bg-muted/30 rounded-lg px-3 py-2.5">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.nama}</p>
                      <p className="text-xs text-muted-foreground">Diminta: {item.jumlahDiminta}</p>
                    </div>
                    <input
                      type="number"
                      min="0"
                      max={item.jumlahDiminta}
                      value={item.jumlahDisetujui}
                      onChange={(e) => {
                        const v = parseInt(e.target.value) || 0;
                        setApproveData((prev) => prev ? {
                          ...prev,
                          items: prev.items.map((i, ii) => ii === idx ? { ...i, jumlahDisetujui: Math.min(v, i.jumlahDiminta) } : i),
                        } : null);
                      }}
                      className="w-20 px-2 py-1.5 text-sm text-right border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background font-semibold"
                    />
                  </div>
                ))}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Catatan Admin (opsional)</label>
                <textarea
                  value={approveData.catatan}
                  onChange={(e) => setApproveData((prev) => prev ? { ...prev, catatan: e.target.value } : null)}
                  placeholder="Misal: Stok terbatas, diberikan sebagian..."
                  rows={2}
                  className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background resize-none"
                />
              </div>

              <div className="flex gap-3 pt-1">
                <button onClick={() => setApproveData(null)} className="flex-1 px-4 py-2.5 text-sm font-medium border rounded-lg hover:bg-muted">
                  Batal
                </button>
                <button
                  onClick={handleApprove}
                  disabled={isPending}
                  className="flex-1 px-4 py-2.5 text-sm font-semibold bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-60"
                >
                  {isPending ? "Menyimpan..." : "Konfirmasi Setuju"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-card rounded-2xl border shadow-2xl w-full max-w-sm animate-fade-in">
            <div className="p-6 space-y-4">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-3">
                  <XCircle className="w-6 h-6 text-red-500" />
                </div>
                <h3 className="font-bold text-foreground">Tolak Permintaan?</h3>
                <p className="text-sm text-muted-foreground mt-1">Berikan alasan penolakan untuk pegawai</p>
              </div>
              <textarea
                value={rejectNote}
                onChange={(e) => setRejectNote(e.target.value)}
                placeholder="Misal: Stok habis, anggaran tidak tersedia..."
                rows={3}
                className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background resize-none"
              />
              <div className="flex gap-3">
                <button onClick={() => setRejectId(null)} className="flex-1 px-4 py-2.5 text-sm font-medium border rounded-lg hover:bg-muted">
                  Batal
                </button>
                <button
                  onClick={handleReject}
                  disabled={isPending}
                  className="flex-1 px-4 py-2.5 text-sm font-semibold bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-60"
                >
                  {isPending ? "Memproses..." : "Tolak Request"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
