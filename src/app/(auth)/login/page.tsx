import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import LoginForm from "./login-form";

export default async function LoginPage() {
  const session = await auth();

  if (session) {
    const role = session.user.role;
    if (role === "ADMIN_GUDANG") {
      redirect("/admin/master-barang");
    } else if (role === "EKSEKUTIF") {
      redirect("/eksekutif/dashboard");
    } else {
      redirect("/pegawai/request-atk");
    }
  }

  return <LoginForm />;
}
