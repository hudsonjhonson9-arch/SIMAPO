// src/lib/auth.ts
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { z } from "zod";
import type { Role } from "@prisma/client";

const loginSchema = z.object({
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const user = await db.user.findUnique({
          where: { email: parsed.data.email },
          include: { bidang: { select: { id: true, nama: true, kode: true } } },
        });

        if (!user || !user.isActive) return null;

        const passwordValid = await bcrypt.compare(
          parsed.data.password,
          user.password
        );
        if (!passwordValid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          nip: user.nip ?? undefined,
          bidangId: user.bidangId ?? undefined,
          bidangNama: user.bidang?.nama ?? undefined,
          avatar: user.avatar ?? undefined,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id!;
        token.role = (user as unknown as { role: Role }).role;
        token.nip = (user as unknown as { nip?: string }).nip;
        token.bidangId = (user as unknown as { bidangId?: string }).bidangId;
        token.bidangNama = (user as unknown as { bidangNama?: string }).bidangNama;
        token.avatar = (user as unknown as { avatar?: string }).avatar;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string;
        (session.user as unknown as { role: Role }).role = token.role as Role;
        (session.user as unknown as { nip?: string }).nip = token.nip as string | undefined;
        (session.user as unknown as { bidangId?: string }).bidangId = token.bidangId as string | undefined;
        (session.user as unknown as { bidangNama?: string }).bidangNama = token.bidangNama as string | undefined;
      }
      return session;
    },
  },
});
