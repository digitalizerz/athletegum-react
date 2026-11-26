import type { Metadata } from "next";
import Link from "next/link";
import { requestPasswordReset } from "@/app/actions/auth";
import { AuthForm, Field } from "@/components/auth-form";

export const metadata: Metadata = { title: "Reset password — AthleteGum" };

export default function ForgotPasswordPage() {
  return (
    <main className="px-6 py-16">
      <AuthForm action={requestPasswordReset} role="business" title="Reset your password" subtitle="We'll email a link if this address has a business or admin account." submitLabel="Send reset link">
        <Field label="Email" name="email" type="email" />
      </AuthForm>
      <p className="mt-6 text-center text-sm text-white/70">
        <Link href="/login" className="underline">Back to sign in</Link>
      </p>
    </main>
  );
}
