"use client";

import { useActionState } from "react";
import { changePassword, type AuthState } from "@/app/actions/auth";

const empty: AuthState = { error: "" };

export function PasswordForm() {
  const [state, action, pending] = useActionState(changePassword, empty);

  return (
    <form action={action} className="mt-4 max-w-xl rounded-3xl border border-black/10 bg-white p-5">
      <h2 className="font-semibold">Password</h2>
      <p className="mt-1 text-sm text-black/50">Use at least 8 characters. This replaces the password for this sign-in.</p>
      <div className="mt-5 grid gap-4">
        <PasswordField label="Current password" name="current" autoComplete="current-password" />
        <PasswordField label="New password" name="password" autoComplete="new-password" />
        <PasswordField label="Confirm new password" name="confirm" autoComplete="new-password" />
      </div>
      {state.error ? <p className="mt-4 text-sm text-red-600">{state.error}</p> : null}
      {state.saved ? <p className="mt-4 text-sm font-medium">Password updated.</p> : null}
      <button disabled={pending} className="mt-5 rounded-full bg-zinc-950 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60">
        {pending ? "Saving…" : "Update password"}
      </button>
    </form>
  );
}

function PasswordField({ label, name, autoComplete }: { label: string; name: string; autoComplete: string }) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-medium">{label}</span>
      <input name={name} type="password" required minLength={name === "current" ? undefined : 8} autoComplete={autoComplete} className="w-full rounded-xl border border-black/10 px-3 py-2.5" />
    </label>
  );
}
