import type { Metadata } from "next";
import Link from "next/link";
import { resetPassword } from "@/app/actions/auth";
import { AuthForm, Field } from "@/components/auth-form";

export const metadata: Metadata = { title: "Choose a new password — AthleteGum" };

export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const token = (await searchParams).token ?? "";
  return (
    <main className="px-6 py-16">
      {token ? (
        <AuthForm action={resetPassword} title="Choose a new password" subtitle="Use at least 8 characters." submitLabel="Update password">
          <input type="hidden" name="token" value={token} />
          <Field label="New password" name="password" type="password" />
          <Field label="Confirm password" name="confirm" type="password" />
        </AuthForm>
      ) : (
        <div className="mx-auto w-full max-w-md border-2 border-white p-8">
          <h1 className="text-3xl font-bold">Reset link missing</h1>
          <p className="mt-2 text-sm text-white/70">Open the link from the reset email, or request a new one.</p>
        </div>
      )}
      <p className="mt-6 text-center text-sm text-white/70">
        <Link href="/forgot-password" className="underline">Request a new link</Link>
      </p>
    </main>
  );
}
