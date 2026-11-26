import type { Metadata } from "next";
import Link from "next/link";
import { registerAthlete } from "@/app/actions/auth";
import { AuthForm, Field } from "@/components/auth-form";

export const metadata: Metadata = { title: "Create an athlete profile — AthleteGum" };

export default function AthleteRegisterPage() {
  return (
    <main className="px-6 py-16">
      <AuthForm action={registerAthlete} title="Create an athlete profile" subtitle="Athletes join free. Use the email brands will invite." submitLabel="Create profile">
        <Field label="Name" name="name" />
        <Field label="Sport" name="sport" required={false} />
        <Field label="School" name="school" required={false} />
        <Field label="Email" name="email" type="email" />
        <Field label="Password" name="password" type="password" />
        <Field label="Confirm password" name="confirm" type="password" />
      </AuthForm>
      <p className="mt-6 text-center text-sm text-white/70">
        Already have a profile? <Link href="/athlete/login" className="underline">Sign in</Link>
      </p>
    </main>
  );
}
