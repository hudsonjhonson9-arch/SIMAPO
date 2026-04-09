// src/app/page.tsx
// Middleware akan handle redirect ke /login jika belum login
// Jika sudah login, layout akan handle berdasarkan role
import { redirect } from "next/navigation";

export default function RootPage() {
  redirect("/login");
}
