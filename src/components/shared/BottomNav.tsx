// src/components/shared/BottomNav.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Home,
  Package,
  ClipboardList,
  Menu,
  Handshake,
  BarChart3,
  LayoutDashboard,
  Wrench,
  Search,
} from "lucide-react";
import type { Role } from "@prisma/client";

interface BottomNavProps {
  role: Role;
}

interface BottomNavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

export function BottomNav({ role }: BottomNavProps) {
  const pathname = usePathname();

  const getNavItems = (): BottomNavItem[] => {
    switch (role) {
      case "ADMIN_GUDANG":
        return [
          { href: "/admin/master-barang", label: "Barang", icon: <Package className="w-5 h-5" /> },
          { href: "/admin/approval",      label: "Approval", icon: <ClipboardList className="w-5 h-5" /> },
          { href: "/admin/barang-masuk",  label: "Masuk", icon: <Search className="w-5 h-5" /> },
          { href: "/admin/pengguna",      label: "Menu", icon: <Menu className="w-5 h-5" /> },
        ];
      case "EKSEKUTIF":
        return [
          { href: "/eksekutif/dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-5 h-5" /> },
          { href: "/eksekutif/laporan",   label: "Laporan", icon: <BarChart3 className="w-5 h-5" /> },
          { href: "/admin/helpdesk",      label: "Menu", icon: <Menu className="w-5 h-5" /> }, // Fallback or extra
        ];
      case "PEGAWAI":
      default:
        return [
          { href: "/pegawai/request-atk", label: "Request", icon: <Package className="w-5 h-5" /> },
          { href: "/pegawai/peminjaman",  label: "Pinjam", icon: <Handshake className="w-5 h-5" /> },
          { href: "/pegawai/helpdesk",    label: "Lapor", icon: <Wrench className="w-5 h-5" /> },
          { href: "/pegawai/menu",        label: "Menu", icon: <Menu className="w-5 h-5" /> },
        ];
    }
  };

  const navItems = getNavItems();

  return (
    <nav className="mobile-bottom-nav">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "mobile-nav-link",
              isActive && "active"
            )}
          >
            <div className={cn(
              "p-1.5 rounded-xl transition-all duration-300",
              isActive ? "bg-primary/10 text-primary shadow-sm" : "text-muted-foreground"
            )}>
              {item.icon}
            </div>
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
