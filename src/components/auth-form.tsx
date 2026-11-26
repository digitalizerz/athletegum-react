"use client";

import { useActionState } from "react";
import type { AuthState } from "@/app/actions/auth";

const empty: AuthState = { error: "" };

export function AuthForm({
  action,
  title,
  subtitle,
  submitLabel,
  role,
  next,
  children,
}: {
  action: (prev: AuthState, formData: FormData) => Promise<AuthState>;
  title: string;
  subtitle: string;
  submitLabel: string;
  role?: "business" | "athlete";
  next?: string;
  children: React.ReactNode;
}) {
  const [state, formAction, pending] = useActionState(action, empty);

  return (
    <form action={formAction} className="mx-auto w-full max-w-md border-2 border-white bg-black p-8 text-white">
      <h1 className="text-3xl font-bold">{title}</h1>
      <p className="mt-2 text-sm text-white/70">{subtitle}</p>
      {role ? <input type="hidden" name="role" value={role} /> : null}
      {next ? <input type="hidden" name="next" value={next} /> : null}
      <div className="mt-8 space-y-4">
        {children}
        {state.error ? <p className="border border-white/30 px-3 py-2 text-sm">{state.error}</p> : null}
        {state.sent ? <p className="border border-white/30 px-3 py-2 text-sm">If an account exists for that email, a reset link is on its way. It expires in 30 minutes.</p> : null}
        <button
          disabled={pending}
          className="w-full bg-white px-4 py-3 text-sm font-semibold text-black hover:bg-zinc-100 disabled:opacity-60"
        >
          {pending ? "Please wait…" : submitLabel}
        </button>
      </div>
    </form>
  );
}

export function Field({
  label,
  name,
  type = "text",
  required = true,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-medium">{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        className="w-full border border-white/30 bg-transparent px-3 py-2 outline-none focus:border-white"
      />
    </label>
  );
}
