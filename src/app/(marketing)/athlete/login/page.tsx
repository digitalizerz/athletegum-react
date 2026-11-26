import type { Metadata } from "next";
import Link from "next/link";
import { login } from "@/app/actions/auth";
import { AuthForm, Field } from "@/components/auth-form";

export const metadata: Metadata = { title: "Athlete sign in — AthleteGum" };

export default function AthleteLoginPage() {
  return (
    <main className="px-6 py-16">
      <AuthForm action={login} role="athlete" title="Athlete sign in" subtitle="See invitations, submit work, and track deals." submitLabel="Sign in">
        <Field label="Email" name="email" type="email" />
        <Field label="Password" name="password" type="password" />
      </AuthForm>
      <p className="mt-6 text-center text-sm text-white/70">
        New athlete? <Link href="/athlete/register" className="underline">Create your profile</Link>
      </p>
    </main>
  );
}
