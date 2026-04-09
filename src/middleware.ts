// src/middleware.ts
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { Role } from "@prisma/client";

const ROLE_HOME: Record<Role, string> = {
  ADMIN_GUDANG: "/admin/master-barang",
  PEGAWAI:      "/pegawai/request-atk",
  EKSEKUTIF:    "/eksekutif/dashboard",
};

const ROLE_ALLOWED_PREFIXES: Record<Role, string[]> = {
  ADMIN_GUDANG: ["/admin"],
  PEGAWAI:      ["/pegawai"],
  EKSEKUTIF:    ["/eksekutif"],
};

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  // Redirect root ke halaman yang sesuai
  if (pathname === "/") {
    if (!session) return NextResponse.redirect(new URL("/login", req.url));
    const role = (session.user as { role: Role }).role;
    return NextResponse.redirect(new URL(ROLE_HOME[role], req.url));
  }

  // Proteksi semua route dashboard
  const isProtected =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/pegawai") ||
    pathname.startsWith("/eksekutif");

  if (isProtected && !session) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (isProtected && session) {
    const role = (session.user as { role: Role }).role;
    const allowedPrefixes = ROLE_ALLOWED_PREFIXES[role];
    const isAllowed = allowedPrefixes.some((prefix) =>
      pathname.startsWith(prefix)
    );

    if (!isAllowed) {
      return NextResponse.redirect(new URL(ROLE_HOME[role], req.url));
    }
  }

  // Kalau sudah login, jangan bisa akses /login lagi
  if (pathname === "/login" && session) {
    const role = (session.user as { role: Role }).role;
    return NextResponse.redirect(new URL(ROLE_HOME[role], req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/",
    "/login",
    "/admin/:path*",
    "/pegawai/:path*",
    "/eksekutif/:path*",
  ],
};
