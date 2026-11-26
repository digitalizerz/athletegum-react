"use client";

import Link from "next/link";
import { useState } from "react";
import { impersonateUser, setUserActive } from "@/app/actions/admin";

export function FilterSelect({ name, label, value, options }: { name: string; label: string; value: string; options: { value: string; label: string }[] }) {
  return (
    <select name={name} aria-label={label} defaultValue={value} onChange={(event) => event.currentTarget.form?.requestSubmit()} className="h-10 rounded-xl border border-black/10 bg-white px-3 text-sm">
      {options.map((option) => (
        <option key={option.value || "all"} value={option.value}>{option.label}</option>
      ))}
    </select>
  );
}

export function RangeSelect({ value }: { value: string }) {
  return (
    <select
      aria-label="Date range"
      defaultValue={value}
      onChange={(event) => {
        const next = event.currentTarget.value;
        window.location.href = next === "30d" ? "/admin" : `/admin?range=${next}`;
      }}
      className="h-10 rounded-xl border border-black/10 bg-white px-3 text-sm"
    >
      <option value="7d">Last 7 days</option>
      <option value="30d">Last 30 days</option>
      <option value="90d">Last 90 days</option>
      <option value="all">All time</option>
    </select>
  );
}

export function AccountMenu({ userId, role, active, href }: { userId: string; role: string; active: boolean; href: string }) {
  const [box, setBox] = useState<{ top: number; left: number } | null>(null);
  return (
    <div className="flex justify-end">
      <button
        type="button"
        aria-label="Account actions"
        aria-expanded={Boolean(box)}
        onClick={(event) => {
          const rect = event.currentTarget.getBoundingClientRect();
          setBox((current) => (current ? null : { top: rect.bottom + 4, left: Math.max(8, rect.right - 176) }));
        }}
        className="grid h-8 w-8 place-items-center rounded-lg text-lg leading-none text-zinc-500 hover:bg-zinc-100"
      >
        ···
      </button>
      {box ? (
        <div className="fixed z-30 w-44 rounded-xl border border-black/10 bg-white p-1 text-sm shadow-lg" style={{ top: box.top, left: box.left }}>
          <Link href={href} className="block rounded-lg px-3 py-2 hover:bg-zinc-100">View account</Link>
          {role !== "admin" && active ? (
            <form action={impersonateUser.bind(null, userId)}>
              <button className="w-full rounded-lg px-3 py-2 text-left hover:bg-zinc-100">View their portal</button>
            </form>
          ) : null}
          {role !== "admin" ? (
            <form action={setUserActive.bind(null, userId, !active)}>
              <button className="w-full rounded-lg px-3 py-2 text-left hover:bg-zinc-100">{active ? "Suspend" : "Reactivate"}</button>
            </form>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
