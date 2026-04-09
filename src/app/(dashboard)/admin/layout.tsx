// src/app/(dashboard)/admin/layout.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session || (session.user as { role: string }).role !== "ADMIN_GUDANG") {
    redirect("/login");
  }
  return <>{children}</>;
}
