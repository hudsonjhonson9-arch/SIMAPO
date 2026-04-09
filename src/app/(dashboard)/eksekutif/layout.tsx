// src/app/(dashboard)/eksekutif/layout.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function EksekutifLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session || (session.user as { role: string }).role !== "EKSEKUTIF") {
    redirect("/login");
  }
  return <>{children}</>;
}
