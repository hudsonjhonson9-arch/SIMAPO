// src/types/next-auth.d.ts
import type { Role } from "@prisma/client";
import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: Role;
      nip?: string;
      bidangId?: string;
      bidangNama?: string;
      image?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Role;
    nip?: string;
    bidangId?: string;
    bidangNama?: string;
    avatar?: string;
  }
}
