// src/app/(dashboard)/pegawai/layout.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function PegawaiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session || (session.user as { role: string }).role !== "PEGAWAI") {
    redirect("/login");
  }
  return <>{children}</>;
}
