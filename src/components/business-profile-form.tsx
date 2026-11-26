"use client";

import { useActionState, useState } from "react";
import { updateBusinessProfile, type ProfileState } from "@/app/actions/profile";

const empty: ProfileState = { error: "" };

const TABS = ["Company info", "Brand", "Social links", "Access"] as const;

type BusinessUser = {
  name: string;
  businessName: string | null;
  email: string;
  phone: string | null;
  city: string | null;
  bio: string | null;
  profilePhoto: string | null;
  instagramHandle: string | null;
  tiktokHandle: string | null;
  twitterHandle: string | null;
  youtubeHandle: string | null;
};

export function BusinessProfileForm({ user }: { user: BusinessUser }) {
  const [state, action, pending] = useActionState(updateBusinessProfile, empty);
  const [tab, setTab] = useState<(typeof TABS)[number]>("Company info");
  const [preview, setPreview] = useState<string | null>(user.profilePhoto);
  const [removeLogo, setRemoveLogo] = useState(false);
  const [bio, setBio] = useState(user.bio ?? "");
  const company = user.businessName || user.name;
  const initials = company.split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase() ?? "").join("") || "AG";

  return (
    <form action={action} className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {TABS.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setTab(item)}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${tab === item ? "bg-zinc-950 text-white" : "bg-white text-black/60"}`}
          >
            {item}
          </button>
        ))}
      </div>

      <div className={tab === "Company info" ? "grid gap-4 xl:grid-cols-[1.2fr_0.8fr]" : "hidden"}>
        <section className="rounded-3xl border border-black/10 bg-white p-5">
          <h2 className="font-semibold">Basic information</h2>
          <p className="mt-1 text-sm text-black/50">The name athletes see on deals.</p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Field label="Company name *" name="businessName" defaultValue={user.businessName ?? ""} />
            <Field label="Your name *" name="name" defaultValue={user.name} />
            <label className="block text-sm">
              <span className="mb-1 block font-medium">Sign-in email</span>
              <input value={user.email} readOnly className="w-full rounded-xl border border-black/10 bg-zinc-50 px-3 py-2.5 text-black/70" />
            </label>
            <Field label="Phone" name="phone" defaultValue={user.phone ?? ""} />
            <Field label="City" name="city" defaultValue={user.city ?? ""} />
          </div>
        </section>
        <section className="rounded-3xl border border-black/10 bg-white p-5">
          <h2 className="font-semibold">About the company</h2>
          <p className="mt-1 text-sm text-black/50">What the business does and the NIL work you are looking for.</p>
          <label className="mt-5 block text-sm">
            <span className="mb-1 block font-medium">Company description</span>
            <textarea
              name="bio"
              value={bio}
              maxLength={300}
              rows={7}
              onChange={(event) => setBio(event.target.value)}
              className="w-full rounded-xl border border-black/10 px-3 py-2.5"
            />
            <span className="mt-1 block text-right text-xs text-black/40">{bio.length}/300</span>
          </label>
        </section>
      </div>

      <section className={tab === "Brand" ? "rounded-3xl border border-black/10 bg-white p-5" : "hidden"}>
        <h2 className="font-semibold">Company logo</h2>
        <p className="mt-1 text-sm text-black/50">Square JPG, PNG, GIF, or WebP. Maximum 2MB.</p>
        <div className="mt-5 flex flex-wrap items-center gap-4">
          {preview && !removeLogo ? (
            <img src={preview} alt="" className="h-20 w-20 rounded-2xl object-cover" />
          ) : (
            <span className="grid h-20 w-20 place-items-center rounded-2xl bg-zinc-950 text-lg font-bold text-white">{initials}</span>
          )}
          <label className="rounded-full border border-black/10 px-4 py-2 text-sm font-semibold">
            Upload logo
            <input
              name="logo"
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              className="sr-only"
              onChange={(event) => {
                const file = event.target.files?.[0];
                setRemoveLogo(false);
                setPreview(file ? URL.createObjectURL(file) : user.profilePhoto);
              }}
            />
          </label>
          {preview || user.profilePhoto ? (
            <button
              type="button"
              className="rounded-full border border-black/10 px-4 py-2 text-sm font-semibold"
              onClick={() => {
                setRemoveLogo(true);
                setPreview(null);
              }}
            >
              Remove
            </button>
          ) : null}
        </div>
        <input type="hidden" name="removeLogo" value={removeLogo ? "1" : "0"} />
      </section>

      <section className={tab === "Social links" ? "rounded-3xl border border-black/10 bg-white p-5" : "hidden"}>
        <h2 className="font-semibold">Social links</h2>
        <p className="mt-1 text-sm text-black/50">Optional. Paste a profile URL or an @handle.</p>
        <div className="mt-5 grid max-w-xl gap-4">
          <Field label="Instagram" name="instagramHandle" defaultValue={user.instagramHandle ?? ""} placeholder="https://instagram.com/yourbrand" />
          <Field label="TikTok" name="tiktokHandle" defaultValue={user.tiktokHandle ?? ""} placeholder="https://tiktok.com/@yourbrand" />
          <Field label="YouTube" name="youtubeHandle" defaultValue={user.youtubeHandle ?? ""} placeholder="https://youtube.com/@yourbrand" />
          <Field label="X" name="twitterHandle" defaultValue={user.twitterHandle ?? ""} placeholder="https://x.com/yourbrand" />
        </div>
      </section>

      <section className={tab === "Access" ? "rounded-3xl border border-black/10 bg-white p-5" : "hidden"}>
        <h2 className="font-semibold">Account access</h2>
        <p className="mt-3 max-w-xl text-sm leading-6 text-black/60">
          {company} uses one sign-in, {user.email}. Change the password in the section below. Teammate invites are not part of this account.
        </p>
      </section>

      {state.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
      {state.saved ? <p className="text-sm font-medium">Saved.</p> : null}
      <div className="flex gap-2">
        <button disabled={pending} className="rounded-full bg-zinc-950 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60">
          {pending ? "Saving…" : "Save changes"}
        </button>
        <button
          type="reset"
          className="rounded-full border border-black/10 bg-white px-4 py-2.5 text-sm font-semibold"
          onClick={() => {
            setPreview(user.profilePhoto);
            setRemoveLogo(false);
            setBio(user.bio ?? "");
          }}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  name,
  defaultValue,
  placeholder,
}: {
  label: string;
  name: string;
  defaultValue: string;
  placeholder?: string;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-medium">{label}</span>
      <input name={name} defaultValue={defaultValue} placeholder={placeholder} className="w-full rounded-xl border border-black/10 bg-white px-3 py-2.5" />
    </label>
  );
}
