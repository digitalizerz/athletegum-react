"use client";

import { useState } from "react";

export function CopyLink({ value, variant = "button" }: { value: string; variant?: "button" | "icon" }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      aria-label={copied ? "Copied" : "Copy link"}
      className={variant === "icon" ? "grid h-8 w-8 shrink-0 place-items-center rounded-lg text-white hover:bg-white/10" : "rounded-full border border-black px-3 py-2 text-sm font-semibold"}
      onClick={async () => {
        await navigator.clipboard.writeText(value);
        setCopied(true);
      }}
    >
      {variant === "icon" ? (
        copied ? <span className="text-xs font-semibold">OK</span> : (
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
            <rect x="8" y="8" width="12" height="12" rx="2" />
            <path d="M4 16V6a2 2 0 0 1 2-2h10" />
          </svg>
        )
      ) : copied ? "Copied" : "Copy link"}
    </button>
  );
}
