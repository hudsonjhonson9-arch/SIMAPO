// src/components/shared/Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Package,
  PackageOpen,
  Users,
  Building2,
  ClipboardList,
  Wrench,
  QrCode,
  FileText,
  LogOut,
  ChevronRight,
  Bell,
  Handshake,
  BarChart3,
} from "lucide-react";
import type { Role } from "@prisma/client";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
}

const adminNav: NavItem[] = [
  { href: "/admin/master-barang",  label: "Master Barang",       icon: <Package className="w-4 h-4" /> },
  { href: "/admin/master-bidang",  label: "Master Bidang",       icon: <Building2 className="w-4 h-4" /> },
  { href: "/admin/barang-masuk",   label: "Barang Masuk",        icon: <PackageOpen className="w-4 h-4" /> },
  { href: "/admin/approval",       label: "Approval Request",    icon: <ClipboardList className="w-4 h-4" /> },
  { href: "/admin/peminjaman",     label: "Kelola Peminjaman",   icon: <Handshake className="w-4 h-4" /> },
  { href: "/admin/helpdesk",       label: "Helpdesk & Tiket",    icon: <Wrench className="w-4 h-4" /> },
  { href: "/admin/stock-opname",   label: "Stock Opname",        icon: <QrCode className="w-4 h-4" /> },
  { href: "/admin/laporan",        label: "Laporan & Export",    icon: <FileText className="w-4 h-4" /> },
  { href: "/admin/pengguna",       label: "Kelola Pengguna",     icon: <Users className="w-4 h-4" /> },
];

const pegawaiNav: NavItem[] = [
  { href: "/pegawai/request-atk",  label: "Request ATK",         icon: <Package className="w-4 h-4" /> },
  { href: "/pegawai/peminjaman",   label: "Peminjaman Aset",     icon: <Handshake className="w-4 h-4" /> },
  { href: "/pegawai/helpdesk",     label: "Lapor Kerusakan",     icon: <Wrench className="w-4 h-4" /> },
];

const eksekutifNav: NavItem[] = [
  { href: "/eksekutif/dashboard",  label: "Dashboard Eksekutif", icon: <LayoutDashboard className="w-4 h-4" /> },
  { href: "/eksekutif/laporan",    label: "Laporan Mutasi",      icon: <BarChart3 className="w-4 h-4" /> },
];

const navByRole: Record<Role, NavItem[]> = {
  ADMIN_GUDANG: adminNav,
  PEGAWAI:      pegawaiNav,
  EKSEKUTIF:    eksekutifNav,
};

  EKSEKUTIF:    "Kepala Badan",

interface SidebarProps {
  role: Role;
  userName: string;
  bidangNama?: string;
}

export function Sidebar({ role, userName, bidangNama }: SidebarProps) {
  const pathname = usePathname();
  const navItems = navByRole[role];

  return (
    <aside className="hidden lg:flex w-64 flex-shrink-0 bg-sidebar h-screen flex-col border-r border-sidebar-border">
      {/* Logo */}
      <div className="p-5 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-sidebar-primary/20 border border-sidebar-primary/30 flex items-center justify-center">
            <Building2 className="w-5 h-5 text-sidebar-primary" />
          </div>
          <div>
            <p className="font-bold text-sidebar-foreground text-sm leading-none">SIMAPO</p>
            <p className="text-[10px] text-sidebar-foreground/50 mt-0.5">Manajemen Aset</p>
          </div>
        </div>
      </div>

      {/* User info */}
      <div className="px-4 py-3 border-b border-sidebar-border">
        <div className="flex items-center gap-3 px-2 py-2 rounded-xl bg-sidebar-accent/50">
          <div className="w-8 h-8 rounded-full bg-sidebar-primary/30 flex items-center justify-center text-sidebar-primary font-semibold text-sm flex-shrink-0">
            {userName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-sidebar-foreground truncate">{userName}</p>
            <p className="text-[10px] text-sidebar-foreground/50">{roleLabel[role]}</p>
            {bidangNama && (
              <p className="text-[10px] text-sidebar-foreground/40 truncate">{bidangNama}</p>
            )}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "sidebar-link",
                isActive && "active"
              )}
            >
              <span className={cn(
                "flex-shrink-0",
                isActive ? "text-sidebar-primary" : "text-sidebar-foreground/50"
              )}>
                {item.icon}
              </span>
              <span className="flex-1 truncate">{item.label}</span>
              {isActive && <ChevronRight className="w-3 h-3 text-sidebar-foreground/30 flex-shrink-0" />}
              {item.badge && item.badge > 0 && (
                <span className="ml-auto bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center flex-shrink-0">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-sidebar-border">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="sidebar-link w-full text-red-400/70 hover:text-red-400 hover:bg-red-500/10"
        >
          <LogOut className="w-4 h-4" />
          <span>Keluar</span>
        </button>
      </div>
    </aside>
  );
}
