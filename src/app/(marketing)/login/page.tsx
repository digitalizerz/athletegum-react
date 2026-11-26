import type { Metadata } from "next";
import Link from "next/link";
import { login } from "@/app/actions/auth";
import { AuthForm, Field } from "@/components/auth-form";

export const metadata: Metadata = { title: "Business sign in — AthleteGum" };

export default function BusinessLoginPage() {
  return (
    <main className="px-6 py-16">
      <AuthForm action={login} role="business" title="Business sign in" subtitle="Manage deals, approvals, and payouts." submitLabel="Sign in">
        <Field label="Email" name="email" type="email" />
        <Field label="Password" name="password" type="password" />
      </AuthForm>
      <p className="mt-6 text-center text-sm text-white/70">
        New here? <Link href="/register" className="underline">Create a business account</Link>
      </p>
    </main>
  );
}
