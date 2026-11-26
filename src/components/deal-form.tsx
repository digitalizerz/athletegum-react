"use client";

import { useActionState } from "react";
import type { FormState } from "@/app/actions/deals";

const empty: FormState = { error: "" };

export function DealForm({
  action,
  children,
  submitLabel,
  pendingLabel = "Saving…",
  hidden,
  className = "space-y-4",
  buttonClassName = "bg-black px-4 py-2 text-sm font-semibold text-white disabled:opacity-60",
}: {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  children: React.ReactNode;
  submitLabel: string;
  pendingLabel?: string;
  hidden?: Record<string, string>;
  className?: string;
  buttonClassName?: string;
}) {
  const [state, formAction, pending] = useActionState(action, empty);
  return (
    <form action={formAction} className={className}>
      {hidden ? Object.entries(hidden).map(([name, value]) => <input key={name} type="hidden" name={name} value={value} />) : null}
      {children}
      {state.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
      <button disabled={pending} className={buttonClassName}>
        {pending ? pendingLabel : submitLabel}
      </button>
    </form>
  );
}
