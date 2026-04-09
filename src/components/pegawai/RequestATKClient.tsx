// src/components/pegawai/RequestATKClient.tsx
"use client";

import { useState, useTransition } from "react";
import {
  ShoppingCart, Plus, Minus, Trash2, Search,
  Package, Send, Clock, CheckCircle, XCircle, AlertTriangle,
} from "lucide-react";
import { submitRequest } from "@/actions/request.actions";
import { formatRupiah, formatTanggal, cn } from "@/lib/utils";
import type { Barang } from "@prisma/client";

type RequestItem = Awaited<ReturnType<typeof import("@/actions/request.actions").getRequestList>>[0];

interface CartEntry {
  barang: Barang;
  jumlah: number;
}

interface Props {
  barangList: Barang[];
  riwayat: RequestItem[];
}

export function RequestATKClient({ barangList, riwayat }: Props) {
  const [cart, setCart] = useState<CartEntry[]>([]);
  const [search, setSearch] = useState("");
  const [catatan, setCatatan] = useState("");
  const [showCart, setShowCart] = useState(false);
  const [activeTab, setActiveTab] = useState<"katalog" | "riwayat">("katalog");
  const [isPending, startTransition] = useTransition();
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const filtered = barangList.filter(
    (b) =>
      b.nama.toLowerCase().includes(search.toLowerCase()) ||
      b.kodeBarang.toLowerCase().includes(search.toLowerCase())
  );

  function addToCart(barang: Barang) {
    setCart((prev) => {
      const existing = prev.find((c) => c.barang.id === barang.id);
      if (existing) {
        return prev.map((c) =>
          c.barang.id === barang.id
            ? { ...c, jumlah: Math.min(c.jumlah + 1, barang.stokSaatIni) }
            : c
        );
      }
      return [...prev, { barang, jumlah: 1 }];
    });
    setShowCart(true);
  }

  function updateQty(barangId: string, delta: number) {
    setCart((prev) =>
      prev
        .map((c) =>
          c.barang.id === barangId
            ? { ...c, jumlah: Math.max(0, Math.min(c.jumlah + delta, c.barang.stokSaatIni)) }
            : c
        )
        .filter((c) => c.jumlah > 0)
    );
  }

  function removeFromCart(barangId: string) {
    setCart((prev) => prev.filter((c) => c.barang.id !== barangId));
  }

  const cartInCart = (id: string) => cart.find((c) => c.barang.id === id);
  const totalItems = cart.reduce((s, c) => s + c.jumlah, 0);
  const totalNilai = cart.reduce(
    (s, c) => s + c.jumlah * Number(c.barang.hargaSatuan),
    0
  );

  async function handleSubmit() {
    if (!cart.length) return;
    setSubmitError("");

    startTransition(async () => {
      const result = await submitRequest(
        cart.map((c) => ({ barangId: c.barang.id, jumlahDiminta: c.jumlah })),
        catatan
      );
      if (result.success) {
        setCart([]);
        setCatatan("");
        setShowCart(false);
        setSubmitSuccess(true);
        setTimeout(() => {
          setSubmitSuccess(false);
          window.location.reload();
        }, 2000);
      } else {
        setSubmitError(typeof result.error === "string" ? result.error : "Gagal mengajukan permintaan");
      }
    });
  }

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Success banner */}
      {submitSuccess && (
        <div className="rounded-xl bg-green-50 border border-green-200 px-5 py-3 flex items-center gap-3 animate-fade-in">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
          <p className="text-sm font-medium text-green-800">
            Permintaan berhasil diajukan! Menunggu persetujuan admin.
          </p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-muted p-1 rounded-xl w-fit">
        {[
          { key: "katalog", label: "Katalog Barang" },
          { key: "riwayat", label: "Riwayat Request" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as "katalog" | "riwayat")}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-all",
              activeTab === tab.key
                ? "bg-card shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "katalog" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Katalog */}
          <div className="lg:col-span-2 space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Cari nama atau kode barang..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 text-sm border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
              />
            </div>

            {/* Grid barang */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filtered.map((barang) => {
                const inCart = cartInCart(barang.id);
                const isLow = barang.stokSaatIni <= barang.minimumStok;
                const isEmpty = barang.stokSaatIni === 0;
                return (
                  <div
                    key={barang.id}
                    className={cn(
                      "bg-card rounded-xl border p-4 flex flex-col gap-3 transition-all",
                      inCart ? "border-primary/50 shadow-sm shadow-primary/10" : "hover:shadow-sm",
                      isEmpty && "opacity-60"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
                        inCart ? "bg-primary/10" : "bg-muted"
                      )}>
                        <Package className={cn(
                          "w-5 h-5",
                          inCart ? "text-primary" : "text-muted-foreground"
                        )} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-sm text-foreground leading-tight">{barang.nama}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{barang.kodeBarang}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className={cn(
                            "text-sm font-bold",
                            isEmpty ? "text-red-500" : isLow ? "text-amber-500" : "text-foreground"
                          )}>
                            {barang.stokSaatIni} {barang.satuan}
                          </span>
                          {isLow && !isEmpty && (
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">{formatRupiah(Number(barang.hargaSatuan))}</p>
                      </div>

                      {isEmpty ? (
                        <span className="text-xs text-red-500 font-medium">Stok Habis</span>
                      ) : inCart ? (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => updateQty(barang.id, -1)}
                            className="w-7 h-7 rounded-lg border flex items-center justify-center hover:bg-muted transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-7 text-center text-sm font-bold">{inCart.jumlah}</span>
                          <button
                            onClick={() => updateQty(barang.id, 1)}
                            disabled={inCart.jumlah >= barang.stokSaatIni}
                            className="w-7 h-7 rounded-lg border flex items-center justify-center hover:bg-muted transition-colors disabled:opacity-40"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => addToCart(barang)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                          Tambah
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Cart sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-xl border shadow-sm sticky top-6">
              {/* Cart header */}
              <div className="flex items-center justify-between px-5 py-4 border-b">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4 text-primary" />
                  <h3 className="font-semibold text-sm">Keranjang</h3>
                </div>
                {totalItems > 0 && (
                  <span className="text-xs font-bold bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </div>

              <div className="p-4 space-y-3">
                {cart.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <ShoppingCart className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="text-xs">Keranjang kosong</p>
                    <p className="text-xs opacity-60 mt-0.5">Klik tombol Tambah pada barang</p>
                  </div>
                ) : (
                  <>
                    {cart.map((c) => (
                      <div key={c.barang.id} className="flex items-center gap-3 bg-muted/30 rounded-lg p-2.5">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold truncate">{c.barang.nama}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {c.jumlah} × {formatRupiah(Number(c.barang.hargaSatuan))}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <button onClick={() => updateQty(c.barang.id, -1)} className="w-5 h-5 rounded flex items-center justify-center hover:bg-muted">
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-bold w-5 text-center">{c.jumlah}</span>
                          <button onClick={() => updateQty(c.barang.id, 1)} disabled={c.jumlah >= c.barang.stokSaatIni} className="w-5 h-5 rounded flex items-center justify-center hover:bg-muted disabled:opacity-40">
                            <Plus className="w-3 h-3" />
                          </button>
                          <button onClick={() => removeFromCart(c.barang.id)} className="w-5 h-5 rounded flex items-center justify-center hover:bg-red-50 text-red-400 ml-0.5">
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}

                    {/* Total */}
                    <div className="border-t pt-3 space-y-1">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Total Item:</span>
                        <span className="font-semibold text-foreground">{totalItems}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Est. Nilai:</span>
                        <span className="font-bold text-foreground">{formatRupiah(totalNilai)}</span>
                      </div>
                    </div>

                    {/* Catatan */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        Catatan (opsional)
                      </label>
                      <textarea
                        value={catatan}
                        onChange={(e) => setCatatan(e.target.value)}
                        placeholder="Keperluan, deadline, atau info tambahan..."
                        rows={2}
                        className="w-full px-3 py-2 text-xs border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background resize-none"
                      />
                    </div>

                    {submitError && (
                      <div className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                        {submitError}
                      </div>
                    )}

                    <button
                      onClick={handleSubmit}
                      disabled={isPending || cart.length === 0}
                      className="w-full py-2.5 text-sm font-semibold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                    >
                      {isPending ? (
                        <>
                          <span className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                          Mengajukan...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Ajukan Permintaan
                        </>
                      )}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "riwayat" && (
        <div className="space-y-3">
          {riwayat.length === 0 ? (
            <div className="bg-card rounded-xl border p-12 text-center text-muted-foreground">
              <Clock className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">Belum ada riwayat permintaan</p>
            </div>
          ) : (
            riwayat.map((req) => (
              <div key={req.id} className="bg-card rounded-xl border p-4 hover:shadow-sm transition-shadow">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <code className="text-xs bg-muted px-2 py-0.5 rounded font-mono">{req.nomorRequest}</code>
                      <span className={cn(
                        "badge-status",
                        req.status === "MENUNGGU"   ? "bg-amber-100 text-amber-700" :
                        req.status === "DISETUJUI"  ? "bg-green-100 text-green-700" :
                        req.status === "DITOLAK"    ? "bg-red-100 text-red-700"    :
                        "bg-blue-100 text-blue-700"
                      )}>
                        {req.status === "MENUNGGU" ? (
                          <><Clock className="w-3 h-3 inline mr-0.5" /> Menunggu</>
                        ) : req.status === "DISETUJUI" ? (
                          <><CheckCircle className="w-3 h-3 inline mr-0.5" /> Disetujui</>
                        ) : req.status === "DITOLAK" ? (
                          <><XCircle className="w-3 h-3 inline mr-0.5" /> Ditolak</>
                        ) : "Diserahkan"}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1.5">{formatTanggal(req.createdAt)}</p>
                  </div>
                  <p className="text-xs text-muted-foreground text-right">
                    {req.detailRequest.length} item
                  </p>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {req.detailRequest.map((d) => (
                    <span key={d.id} className="text-xs bg-muted px-2.5 py-1 rounded-full text-muted-foreground">
                      {d.barang.nama} × {d.jumlahDiminta}
                      {d.jumlahDisetujui !== null && d.jumlahDisetujui !== d.jumlahDiminta && (
                        <span className="text-amber-600"> (disetujui: {d.jumlahDisetujui})</span>
                      )}
                    </span>
                  ))}
                </div>
                {req.catatanAdmin && (
                  <p className="mt-2 text-xs text-blue-700 bg-blue-50 rounded-lg px-3 py-1.5 border border-blue-200">
                    <span className="font-semibold">Catatan Admin:</span> {req.catatanAdmin}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
