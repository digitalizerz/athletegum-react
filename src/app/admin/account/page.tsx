import { requireUser } from "@/app/actions/auth";
import { PasswordForm } from "@/components/password-form";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminAccountPage() {
  const session = await requireUser("admin");
  const user = await prisma.user.findUnique({ where: { id: session.id } });

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight">Account</h1>
      <p className="mt-2 text-sm text-zinc-500">Signed in as {user?.email ?? session.email}. The sign-in email is not changed here.</p>
      <PasswordForm />
    </div>
  );
}
