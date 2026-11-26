import type { Metadata } from "next";
import Link from "next/link";
import { login } from "@/app/actions/auth";
import { AuthForm, Field } from "@/components/auth-form";

export const metadata: Metadata = { title: "Business sign in — AthleteGum" };

export default async function BusinessLoginPage({ searchParams }: { searchParams: Promise<{ next?: string; reset?: string }> }) {
  const params = await searchParams;
  const next = params.next;
  const safeNext = next?.startsWith("/dashboard") && !next.startsWith("//") ? next : undefined;
  return (
    <main className="px-6 py-16">
      <AuthForm action={login} role="business" next={safeNext} title="Business sign in" subtitle="Manage deals, approvals, and payouts." submitLabel="Sign in">
        <Field label="Email" name="email" type="email" />
        <Field label="Password" name="password" type="password" />
        <p className="text-right text-sm"><Link href="/forgot-password" className="underline">Forgot password?</Link></p>
      </AuthForm>
      {params.reset ? <p className="mt-6 text-center text-sm text-white/80">Password updated. Sign in with the new one.</p> : null}
      <p className="mt-6 text-center text-sm text-white/70">
        New here? <Link href="/register" className="underline">Create a business account</Link>
      </p>
    </main>
  );
}
