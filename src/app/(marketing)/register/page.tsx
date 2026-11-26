import type { Metadata } from "next";
import Link from "next/link";
import { registerBusiness } from "@/app/actions/auth";
import { AuthForm, Field } from "@/components/auth-form";

export const metadata: Metadata = { title: "Create a business account — AthleteGum" };

export default function RegisterPage() {
  return (
    <main className="px-6 py-16">
      <AuthForm action={registerBusiness} title="Create a business account" subtitle="Free plan includes 3 active deals." submitLabel="Create account">
        <Field label="Your name" name="name" />
        <Field label="Business name" name="businessName" required={false} />
        <Field label="Email" name="email" type="email" />
        <Field label="Password" name="password" type="password" />
        <Field label="Confirm password" name="confirm" type="password" />
      </AuthForm>
      <p className="mt-6 text-center text-sm text-white/70">
        Already registered? <Link href="/login" className="underline">Sign in</Link>
      </p>
    </main>
  );
}
