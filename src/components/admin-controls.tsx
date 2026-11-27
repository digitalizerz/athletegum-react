"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { deleteUser, impersonateUser, setUserActive } from "@/app/actions/admin";
import { deleteListing } from "@/app/actions/directory";

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

export function AccountMenu({ userId, role, active, href, editHref, deleteName }: { userId: string; role: string; active: boolean; href: string; editHref?: string; deleteName?: string }) {
  const [box, setBox] = useState<{ top: number; left: number } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
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
          {editHref ? <Link href={editHref} className="block rounded-lg px-3 py-2 hover:bg-zinc-100">Edit profile</Link> : null}
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
          {deleteName ? (
            <button
              type="button"
              className="w-full rounded-lg px-3 py-2 text-left text-red-700 hover:bg-red-50"
              onClick={() => {
                setBox(null);
                setConfirmDelete(true);
              }}
            >
              Delete
            </button>
          ) : null}
        </div>
      ) : null}
      {confirmDelete && deleteName ? (
        <WarningDialog
          title={`Delete ${deleteName}?`}
          body="This removes their login. Existing deals stay on record, with this athlete cleared from them. This cannot be undone."
          confirmLabel="Delete athlete"
          action={deleteUser.bind(null, userId)}
          onClose={() => setConfirmDelete(false)}
        />
      ) : null}
    </div>
  );
}

export function ListingMenu({ listingId, name, interests }: { listingId: string; name: string; interests: number }) {
  const [box, setBox] = useState<{ top: number; left: number } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const interestLine = interests === 0 ? "No businesses have asked about them." : `${interests} introduction ${interests === 1 ? "request" : "requests"} for this listing will be removed.`;
  return (
    <div className="flex justify-end">
      <button
        type="button"
        aria-label="Listing actions"
        aria-expanded={Boolean(box)}
        onClick={(event) => {
          const rect = event.currentTarget.getBoundingClientRect();
          setBox((current) => (current ? null : { top: rect.bottom + 4, left: Math.max(8, rect.right - 160) }));
        }}
        className="grid h-8 w-8 place-items-center rounded-lg text-lg leading-none text-zinc-500 hover:bg-zinc-100"
      >
        ···
      </button>
      {box ? (
        <div className="fixed z-30 w-40 rounded-xl border border-black/10 bg-white p-1 text-sm shadow-lg" style={{ top: box.top, left: box.left }}>
          <Link href={`/admin/directory/${listingId}?edit=1`} className="block rounded-lg px-3 py-2 hover:bg-zinc-100">Edit profile</Link>
          <button
            type="button"
            className="w-full rounded-lg px-3 py-2 text-left text-red-700 hover:bg-red-50"
            onClick={() => {
              setBox(null);
              setConfirmDelete(true);
            }}
          >
            Delete
          </button>
        </div>
      ) : null}
      {confirmDelete ? (
        <WarningDialog
          title={`Remove ${name} from the directory?`}
          body={`Businesses will no longer see this listing. ${interestLine} This does not delete a login.`}
          confirmLabel="Remove listing"
          action={deleteListing.bind(null, listingId)}
          onClose={() => setConfirmDelete(false)}
        />
      ) : null}
    </div>
  );
}

export function DeleteListingButton({ listingId, name, interests }: { listingId: string; name: string; interests: number }) {
  const [open, setOpen] = useState(false);
  const interestLine = interests === 0 ? "No businesses have asked about them." : `${interests} introduction ${interests === 1 ? "request" : "requests"} for this listing will be removed.`;
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="h-10 rounded-xl border border-red-200 px-3 text-sm font-semibold text-red-700">Delete</button>
      {open ? (
        <WarningDialog
          title={`Remove ${name} from the directory?`}
          body={`Businesses will no longer see this listing. ${interestLine} This does not delete a login.`}
          confirmLabel="Remove listing"
          action={deleteListing.bind(null, listingId)}
          onClose={() => setOpen(false)}
        />
      ) : null}
    </>
  );
}

export function DeleteAthleteButton({ userId, name }: { userId: string; name: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="h-10 rounded-xl border border-red-200 px-3 text-sm font-semibold text-red-700">Delete</button>
      {open ? (
        <WarningDialog
          title={`Delete ${name}?`}
          body="This removes their login. Existing deals stay on record, with this athlete cleared from them. This cannot be undone."
          confirmLabel="Delete athlete"
          action={deleteUser.bind(null, userId)}
          onClose={() => setOpen(false)}
        />
      ) : null}
    </>
  );
}

function WarningDialog({ title, body, confirmLabel, action, onClose }: { title: string; body: string; confirmLabel: string; action: (formData: FormData) => void; onClose: () => void }) {
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" role="dialog" aria-modal="true" aria-labelledby="delete-warning-title" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl" onClick={(event) => event.stopPropagation()}>
        <h2 id="delete-warning-title" className="text-lg font-semibold">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-zinc-600">{body}</p>
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="h-10 rounded-xl border border-black/10 px-4 text-sm font-semibold">Cancel</button>
          <form action={action}>
            <input type="hidden" name="confirm" value="delete" />
            <button className="h-10 rounded-xl bg-red-600 px-4 text-sm font-semibold text-white">{confirmLabel}</button>
          </form>
        </div>
      </div>
    </div>
  );
}
