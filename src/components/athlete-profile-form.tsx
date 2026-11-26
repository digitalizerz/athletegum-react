"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { updateAthleteProfile, type ProfileState } from "@/app/actions/profile";
import { CopyLink } from "@/components/copy-link";
import { ATHLETE_LEVELS } from "@/lib/profile";

const empty: ProfileState = { error: "" };
const TABS = ["Profile", "Photo", "Social links", "Public link"] as const;
const BIO_LIMIT = 1000;

type ProfileUser = {
  name: string;
  email: string;
  athleteLevel: string | null;
  sport: string | null;
  school: string | null;
  city: string | null;
  bio: string | null;
  username: string | null;
  profilePhoto: string | null;
  instagramHandle: string | null;
  tiktokHandle: string | null;
  twitterHandle: string | null;
  youtubeHandle: string | null;
  profileUrl: string;
};

export function AthleteProfileForm({ user }: { user: ProfileUser }) {
  const [state, action, pending] = useActionState(updateAthleteProfile, empty);
  const [tab, setTab] = useState<(typeof TABS)[number]>("Profile");
  const [preview, setPreview] = useState<string | null>(user.profilePhoto);
  const [removePhoto, setRemovePhoto] = useState(false);
  const [bio, setBio] = useState(user.bio ?? "");
  const initials = user.name.split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase() ?? "").join("") || "A";

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

      <div className={tab === "Profile" ? "grid gap-4 xl:grid-cols-[1.2fr_0.8fr]" : "hidden"}>
        <section className="rounded-3xl border border-black/10 bg-white p-5">
          <h2 className="font-semibold">Basic information</h2>
          <p className="mt-1 text-sm text-black/50">The name and school businesses see on your profile.</p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Field label="Full name *" name="name" defaultValue={user.name} />
            <label className="block text-sm">
              <span className="mb-1 block font-medium">Level *</span>
              <select name="athleteLevel" defaultValue={user.athleteLevel ?? "college"} className="w-full rounded-xl border border-black/10 bg-white px-3 py-2.5">
                {ATHLETE_LEVELS.map((level) => (
                  <option key={level.id} value={level.id}>{level.label}</option>
                ))}
              </select>
            </label>
            <Field label="Sport" name="sport" defaultValue={user.sport ?? ""} placeholder="Basketball" />
            <Field label="School or team" name="school" defaultValue={user.school ?? ""} placeholder="State University" />
            <Field label="City" name="city" defaultValue={user.city ?? ""} />
            <label className="block text-sm">
              <span className="mb-1 block font-medium">Sign-in email</span>
              <input value={user.email} readOnly className="w-full rounded-xl border border-black/10 bg-zinc-50 px-3 py-2.5 text-black/70" />
            </label>
          </div>
        </section>
        <section className="rounded-3xl border border-black/10 bg-white p-5">
          <h2 className="font-semibold">About you</h2>
          <p className="mt-1 text-sm text-black/50">What you play and the NIL work you want.</p>
          <label className="mt-5 block text-sm">
            <span className="mb-1 block font-medium">Bio</span>
            <textarea
              name="bio"
              value={bio}
              maxLength={BIO_LIMIT}
              rows={8}
              onChange={(event) => setBio(event.target.value)}
              className="w-full rounded-xl border border-black/10 px-3 py-2.5"
            />
            <span className="mt-1 block text-right text-xs text-black/40">{bio.length}/{BIO_LIMIT}</span>
          </label>
        </section>
      </div>

      <section className={tab === "Photo" ? "rounded-3xl border border-black/10 bg-white p-5" : "hidden"}>
        <h2 className="font-semibold">Profile photo</h2>
        <p className="mt-1 text-sm text-black/50">Square JPG, PNG, GIF, or WebP. Maximum 2MB.</p>
        <div className="mt-5 flex flex-wrap items-center gap-4">
          {preview && !removePhoto ? (
            <img src={preview} alt="" className="h-20 w-20 rounded-2xl object-cover" />
          ) : (
            <span className="grid h-20 w-20 place-items-center rounded-2xl bg-zinc-950 text-lg font-bold text-white">{initials}</span>
          )}
          <label className="rounded-full border border-black/10 px-4 py-2 text-sm font-semibold">
            Upload photo
            <input
              name="profilePhoto"
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              className="sr-only"
              onChange={(event) => {
                const file = event.target.files?.[0];
                setRemovePhoto(false);
                setPreview(file ? URL.createObjectURL(file) : user.profilePhoto);
              }}
            />
          </label>
          {preview || user.profilePhoto ? (
            <button
              type="button"
              className="rounded-full border border-black/10 px-4 py-2 text-sm font-semibold"
              onClick={() => {
                setRemovePhoto(true);
                setPreview(null);
              }}
            >
              Remove
            </button>
          ) : null}
        </div>
        <input type="hidden" name="removePhoto" value={removePhoto ? "1" : "0"} />
      </section>

      <section className={tab === "Social links" ? "rounded-3xl border border-black/10 bg-white p-5" : "hidden"}>
        <h2 className="font-semibold">Social links</h2>
        <p className="mt-1 text-sm text-black/50">Optional. Paste a profile URL or an @handle. Follower counts are not shown.</p>
        <div className="mt-5 grid max-w-xl gap-4">
          <Field label="Instagram" name="instagramHandle" defaultValue={user.instagramHandle ?? ""} placeholder="https://instagram.com/yourname" />
          <Field label="TikTok" name="tiktokHandle" defaultValue={user.tiktokHandle ?? ""} placeholder="https://tiktok.com/@yourname" />
          <Field label="YouTube" name="youtubeHandle" defaultValue={user.youtubeHandle ?? ""} placeholder="https://youtube.com/@yourname" />
          <Field label="X" name="twitterHandle" defaultValue={user.twitterHandle ?? ""} placeholder="https://x.com/yourname" />
        </div>
      </section>

      <section className={tab === "Public link" ? "rounded-3xl border border-black/10 bg-white p-5" : "hidden"}>
        <h2 className="font-semibold">Public profile link</h2>
        <p className="mt-1 text-sm text-black/50">This is the page businesses open. Leave the username blank to keep the private link.</p>
        <label className="mt-5 block max-w-xl text-sm">
          <span className="mb-1 block font-medium">Username</span>
          <span className="flex items-center rounded-xl border border-black/10 bg-white">
            <span className="px-3 text-black/40">/a/</span>
            <input name="username" defaultValue={user.username ?? ""} placeholder="your-username" className="w-full rounded-r-xl px-3 py-2.5 outline-none" />
          </span>
          <span className="mt-2 block text-xs text-black/50">Lowercase letters, numbers, and hyphens. The link updates after you save.</span>
        </label>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <code className="rounded-xl border border-black/10 bg-zinc-50 px-3 py-2 text-sm">{user.profileUrl}</code>
          <CopyLink value={user.profileUrl} />
          <Link href={user.profileUrl} className="rounded-full border border-black/10 px-4 py-2 text-sm font-semibold">View profile</Link>
        </div>
        <ul className="mt-4 space-y-1 text-sm text-black/60">
          <li>Add it to your Instagram bio.</li>
          <li>Put it in your email signature.</li>
          <li>Send it to brands you want to work with.</li>
        </ul>
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
            setRemovePhoto(false);
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
