// src/components/shared/MobileSidebar.tsx
"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { X, LogOut, Building2, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Role } from "@prisma/client";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

const adminNav: NavItem[] = [
  { href: "/admin/master-barang",  label: "Master Barang",       icon: <Building2 className="w-4 h-4" /> },
  { href: "/admin/master-bidang",  label: "Master Bidang",       icon: <Building2 className="w-4 h-4" /> },
  { href: "/admin/barang-masuk",   label: "Barang Masuk",        icon: <Building2 className="w-4 h-4" /> },
  { href: "/admin/approval",       label: "Approval Request",    icon: <Building2 className="w-4 h-4" /> },
  { href: "/admin/peminjaman",     label: "Kelola Peminjaman",   icon: <Building2 className="w-4 h-4" /> },
  { href: "/admin/helpdesk",       label: "Helpdesk & Tiket",    icon: <Building2 className="w-4 h-4" /> },
  { href: "/admin/stock-opname",   label: "Stock Opname",        icon: <Building2 className="w-4 h-4" /> },
  { href: "/admin/laporan",        label: "Laporan & Export",    icon: <Building2 className="w-4 h-4" /> },
  { href: "/admin/pengguna",       label: "Kelola Pengguna",     icon: <Building2 className="w-4 h-4" /> },
];

const pegawaiNav: NavItem[] = [
  { href: "/pegawai/request-atk",  label: "Request ATK",         icon: <Building2 className="w-4 h-4" /> },
  { href: "/pegawai/peminjaman",   label: "Peminjaman Aset",     icon: <Building2 className="w-4 h-4" /> },
  { href: "/pegawai/helpdesk",     label: "Lapor Kerusakan",     icon: <Building2 className="w-4 h-4" /> },
];

const eksekutifNav: NavItem[] = [
  { href: "/eksekutif/dashboard",  label: "Dashboard Eksekutif", icon: <Building2 className="w-4 h-4" /> },
  { href: "/eksekutif/laporan",    label: "Laporan Mutasi",      icon: <Building2 className="w-4 h-4" /> },
];

const navByRole: Record<Role, NavItem[]> = {
  ADMIN_GUDANG: adminNav,
  PEGAWAI:      pegawaiNav,
  EKSEKUTIF:    eksekutifNav,
};

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  role: Role;
  userName: string;
  userRole: string;
}

export function MobileSidebar({ isOpen, onClose, role, userName, userRole }: MobileSidebarProps) {
  const pathname = usePathname();
  const navItems = navByRole[role];

  // Close sidebar on navigation
  useEffect(() => {
    if (isOpen) onClose();
  }, [pathname]);

  // Prevent scrolling when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] lg:hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <aside className="absolute top-0 left-0 bottom-0 w-[280px] bg-sidebar flex flex-col shadow-2xl animate-in slide-in-from-left duration-300">
        {/* Header */}
        <div className="p-5 border-b border-sidebar-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sidebar-primary/20 border border-sidebar-primary/30 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-sidebar-primary" />
            </div>
            <p className="font-bold text-sidebar-foreground text-sm">SIMAPO</p>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-sidebar-accent flex items-center justify-center text-sidebar-foreground/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Profile */}
        <div className="p-5 border-b border-sidebar-border bg-sidebar-accent/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-sidebar-primary/30 flex items-center justify-center text-sidebar-primary font-bold">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-bold text-sidebar-foreground truncate">{userName}</p>
              <p className="text-[10px] text-sidebar-foreground/50 uppercase tracking-wider">{userRole}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                  isActive 
                    ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                    : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                )}
              >
                <span className={cn(
                  "p-1.5 rounded-lg",
                  isActive ? "bg-sidebar-primary/20 text-sidebar-primary" : "bg-sidebar-foreground/5"
                )}>
                  {item.icon}
                </span>
                <span className="flex-1">{item.label}</span>
                {isActive && <ChevronRight className="w-4 h-4 opacity-50" />}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-sidebar-border">
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-400 font-medium hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Keluar Sesi</span>
          </button>
        </div>
      </aside>
    </div>
  );
}
