"use client";

import { useState } from "react";
import { createAccount } from "@/app/actions/admin";
import { ATHLETE_LEVELS } from "@/lib/profile";

const steps = ["Identity", "Athletics", "Profile", "Review"];

export function AddAthleteWizard({ error }: { error?: string }) {
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState({ name: "", email: "", password: "", athleteLevel: "college", school: "", sport: "", city: "", bio: "", instagramHandle: "" });

  function update(key: keyof typeof draft, value: string) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  return (
    <div className="mx-auto max-w-xl">
      <p className="text-sm text-zinc-500">Athletes / Add Athlete</p>
      <h1 className="mt-2 text-2xl font-bold tracking-tight">Add Athlete</h1>
      <ol className="mt-6 flex items-center gap-2">
        {steps.map((label, index) => (
          <li key={label} className="flex flex-1 items-center gap-2">
            <span className={`grid h-7 w-7 place-items-center rounded-full text-xs font-semibold ${index <= step ? "bg-zinc-950 text-white" : "bg-zinc-200 text-zinc-500"}`}>{index + 1}</span>
            <span className={`text-xs font-medium ${index === step ? "text-zinc-950" : "text-zinc-400"}`}>{label}</span>
            {index < steps.length - 1 ? <span className="h-px flex-1 bg-zinc-200" /> : null}
          </li>
        ))}
      </ol>
      {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

      {step === 0 ? (
        <section className="mt-6 rounded-2xl border border-black/10 bg-white p-5">
          <h2 className="font-semibold">Athlete identity</h2>
          <p className="mt-1 text-sm text-zinc-500">This creates a login. The password is temporary until they change it.</p>
          <Field label="Full name" value={draft.name} onChange={(value) => update("name", value)} />
          <Field label="Email" type="email" value={draft.email} onChange={(value) => update("email", value)} />
          <Field label="Temporary password" type="password" value={draft.password} onChange={(value) => update("password", value)} />
          <div className="mt-5 flex justify-end gap-2">
            <button type="button" disabled={!draft.name.trim() || !draft.email.includes("@") || draft.password.length < 8} onClick={() => setStep(1)} className="h-10 rounded-xl bg-zinc-950 px-4 text-sm font-semibold text-white disabled:opacity-40">Continue</button>
          </div>
        </section>
      ) : null}

      {step === 1 ? (
        <section className="mt-6 rounded-2xl border border-black/10 bg-white p-5">
          <h2 className="font-semibold">Athletics</h2>
          <label className="mt-4 block text-sm font-medium">Level
            <select value={draft.athleteLevel} onChange={(event) => update("athleteLevel", event.target.value)} className="mt-1 h-10 w-full rounded-xl border border-black/10 px-3 text-sm">
              {ATHLETE_LEVELS.map((level) => <option key={level.id} value={level.id}>{level.label}</option>)}
            </select>
          </label>
          <Field label="School or team" value={draft.school} onChange={(value) => update("school", value)} />
          <Field label="Sport" value={draft.sport} onChange={(value) => update("sport", value)} />
          <Field label="City" value={draft.city} onChange={(value) => update("city", value)} />
          <p className="mt-3 text-xs text-zinc-500">High school accounts can be found, but a business cannot pay them through a deal.</p>
          <div className="mt-5 flex justify-between">
            <button type="button" onClick={() => setStep(0)} className="h-10 rounded-xl border border-black/10 px-4 text-sm font-semibold">Back</button>
            <button type="button" onClick={() => setStep(2)} className="h-10 rounded-xl bg-zinc-950 px-4 text-sm font-semibold text-white">Continue</button>
          </div>
        </section>
      ) : null}

      {step === 2 ? (
        <section className="mt-6 rounded-2xl border border-black/10 bg-white p-5">
          <h2 className="font-semibold">Profile</h2>
          <p className="mt-1 text-sm text-zinc-500">Optional. They can fill the rest in after they sign in.</p>
          <Field label="Instagram" value={draft.instagramHandle} onChange={(value) => update("instagramHandle", value)} />
          <label className="mt-4 block text-sm font-medium">Short bio
            <textarea value={draft.bio} onChange={(event) => update("bio", event.target.value)} maxLength={300} className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2 text-sm outline-none" rows={3} />
          </label>
          <div className="mt-5 flex justify-between">
            <button type="button" onClick={() => setStep(1)} className="h-10 rounded-xl border border-black/10 px-4 text-sm font-semibold">Back</button>
            <button type="button" onClick={() => setStep(3)} className="h-10 rounded-xl bg-zinc-950 px-4 text-sm font-semibold text-white">Continue</button>
          </div>
        </section>
      ) : null}

      {step === 3 ? (
        <form action={createAccount} className="mt-6 rounded-2xl border border-black/10 bg-white p-5">
          <h2 className="font-semibold">Review & create</h2>
          <p className="mt-1 text-sm text-zinc-500">Confirm the account before it can sign in.</p>
          <input type="hidden" name="wizard" value="1" />
          <input type="hidden" name="role" value="athlete" />
          <input type="hidden" name="name" value={draft.name} />
          <input type="hidden" name="email" value={draft.email} />
          <input type="hidden" name="password" value={draft.password} />
          <input type="hidden" name="athleteLevel" value={draft.athleteLevel} />
          <input type="hidden" name="school" value={draft.school} />
          <input type="hidden" name="sport" value={draft.sport} />
          <input type="hidden" name="city" value={draft.city} />
          <input type="hidden" name="bio" value={draft.bio} />
          <input type="hidden" name="instagramHandle" value={draft.instagramHandle} />
          <dl className="mt-4 divide-y divide-black/5 text-sm">
            <Row label="Name" value={draft.name} />
            <Row label="Email" value={draft.email} />
            <Row label="Level" value={ATHLETE_LEVELS.find((level) => level.id === draft.athleteLevel)?.label ?? draft.athleteLevel} />
            <Row label="School" value={draft.school || "—"} />
            <Row label="Sport" value={draft.sport || "—"} />
            <Row label="City" value={draft.city || "—"} />
            <Row label="Instagram" value={draft.instagramHandle || "—"} />
          </dl>
          <div className="mt-5 flex justify-between">
            <button type="button" onClick={() => setStep(2)} className="h-10 rounded-xl border border-black/10 px-4 text-sm font-semibold">Back</button>
            <button className="h-10 rounded-xl bg-zinc-950 px-4 text-sm font-semibold text-white">Create Athlete</button>
          </div>
        </form>
      ) : null}
    </div>
  );
}

function Field({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (value: string) => void; type?: string }) {
  return (
    <label className="mt-4 block text-sm font-medium">
      {label}
      <input type={type} value={value} onChange={(event) => onChange(event.target.value)} className="mt-1 h-10 w-full rounded-xl border border-black/10 px-3 text-sm outline-none" />
    </label>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 py-2.5">
      <dt className="text-zinc-500">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}
