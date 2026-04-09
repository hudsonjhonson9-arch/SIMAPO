// src/app/(dashboard)/layout.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/shared/Sidebar";
import type { Role } from "@prisma/client";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  const user = session.user as {
    name: string;
    role: Role;
    bidangNama?: string;
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar
        role={user.role}
        userName={user.name}
        bidangNama={user.bidangNama}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        {children}
      </div>
    </div>
  );
}
