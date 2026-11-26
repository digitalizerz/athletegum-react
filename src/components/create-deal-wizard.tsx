"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { createDeal, type FormState } from "@/app/actions/deals";
import { AthleteAvatar } from "@/components/athlete-avatar";
import { DEAL_TYPES, money, PLATFORMS, splitCompensation } from "@/lib/deals";

const empty: FormState = { error: "" };

const STEPS = ["Athlete", "Deal details", "Compensation", "Review & fund"] as const;

const CATEGORIES = [
  {
    id: "social",
    title: "Social Content",
    body: "A social post or a short video on the platforms you choose.",
    types: ["social_post", "short_video"],
    icon: "phone",
  },
  {
    id: "appearances",
    title: "Appearances & Events",
    body: "An in-person appearance.",
    types: ["in_person_appearance"],
    icon: "calendar",
  },
  {
    id: "product",
    title: "Product Promotions",
    body: "A product review.",
    types: ["product_review"],
    icon: "box",
  },
  {
    id: "ongoing",
    title: "Ongoing Partnerships",
    body: "A partnership for one month.",
    types: ["monthly_partnership"],
    icon: "handshake",
  },
  {
    id: "custom",
    title: "Custom",
    body: "A deal that does not fit the types above.",
    types: ["custom"],
    icon: "custom",
  },
] as const;

type Screen = "athlete" | "type" | "details" | "compensation" | "review";

type AthleteOption = {
  name: string;
  email: string;
  sport: string | null;
  school: string | null;
  profilePhoto: string | null;
};

export function CreateDealWizard({
  athletes,
  feePercent,
  initialEmail,
}: {
  athletes: AthleteOption[];
  feePercent: number;
  initialEmail: string;
}) {
  const [state, action, pending] = useActionState(createDeal, empty);
  const matched = athletes.find((athlete) => athlete.email === initialEmail);
  const [screen, setScreen] = useState<Screen>(matched ? "type" : "athlete");
  const [email, setEmail] = useState(matched?.email ?? initialEmail);
  const [typedEmail, setTypedEmail] = useState(matched ? "" : initialEmail);
  const [categoryId, setCategoryId] = useState<(typeof CATEGORIES)[number]["id"] | "">("");
  const [dealType, setDealType] = useState("");
  const [platforms, setPlatforms] = useState<string[]>([]);
  const [startsAt, setStartsAt] = useState("");
  const [deadline, setDeadline] = useState("");
  const [notes, setNotes] = useState("");
  const [compensation, setCompensation] = useState("");
  const [notice, setNotice] = useState("");

  const category = CATEGORIES.find((item) => item.id === categoryId);
  const type = DEAL_TYPES.find((item) => item.id === dealType);
  const athlete = athletes.find((item) => item.email === email);
  const amount = Number(compensation);
  const split = Number.isFinite(amount) && amount > 0 ? splitCompensation(amount, feePercent) : null;
  const stepIndex = screen === "athlete" ? 0 : screen === "type" || screen === "details" ? 1 : screen === "compensation" ? 2 : 3;

  function continueFlow() {
    const problem = validate(screen, { email, categoryId, dealType, platforms, startsAt, deadline, compensation });
    if (problem) {
      setNotice(problem);
      return;
    }
    setNotice("");
    if (screen === "athlete") setScreen("type");
    else if (screen === "type") setScreen("details");
    else if (screen === "details") setScreen("compensation");
    else if (screen === "compensation") setScreen("review");
  }

  function back() {
    setNotice("");
    if (screen === "type") setScreen("athlete");
    else if (screen === "details") setScreen("type");
    else if (screen === "compensation") setScreen("details");
    else if (screen === "review") setScreen("compensation");
  }

  const copy = leftCopy(screen, athlete?.name);

  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (screen !== "review") event.preventDefault();
      }}
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link href="/dashboard/deals" className="text-sm font-semibold text-black/70 hover:text-black">‹ Create a NIL deal</Link>
        <ol className="flex items-start">
          {STEPS.map((label, index) => {
            const reached = index <= stepIndex;
            return (
              <li key={label} className="flex w-28 flex-col items-center sm:w-36">
                <span className="flex w-full items-center">
                  <span className={`h-px flex-1 ${index === 0 ? "bg-transparent" : index <= stepIndex ? "bg-zinc-950" : "bg-zinc-200"}`} />
                  <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-sm font-semibold ${reached ? "bg-zinc-950 text-white" : "border border-zinc-300 bg-white text-black/40"}`}>{index + 1}</span>
                  <span className={`h-px flex-1 ${index === STEPS.length - 1 ? "bg-transparent" : index < stepIndex ? "bg-zinc-950" : "bg-zinc-200"}`} />
                </span>
                <span className={`mt-2 text-center text-xs ${reached ? "font-semibold" : "text-black/40"}`}>{label}</span>
              </li>
            );
          })}
        </ol>
        <span className="hidden w-36 lg:block" />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[0.85fr_1.15fr]">
        <section className="flex min-h-80 flex-col rounded-3xl bg-zinc-100 p-6 sm:p-8 lg:h-full">
          <h1 className="text-4xl font-bold tracking-tight">{copy.title}</h1>
          <p className="mt-4 max-w-sm text-black/60">{copy.body}</p>
          <img src="/media/court.jpg" alt="" className="mt-auto h-40 w-full rounded-2xl object-cover grayscale" />
        </section>

        <div className="space-y-3">
          {screen === "athlete" ? (
            <>
              {athletes.map((item) => (
                <button
                  key={item.email}
                  type="button"
                  onClick={() => {
                    setEmail(item.email);
                    setTypedEmail("");
                    setNotice("");
                  }}
                  className={`flex w-full items-center gap-3 rounded-2xl border bg-white px-4 py-3 text-left ${email === item.email && !typedEmail ? "border-zinc-950" : "border-black/10"}`}
                >
                  <AthleteAvatar name={item.name} photo={item.profilePhoto} size={44} />
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold">{item.name}</span>
                    <span className="block truncate text-sm text-black/50">{[item.sport, item.school].filter(Boolean).join(" · ") || item.email}</span>
                  </span>
                  {email === item.email && !typedEmail ? <Check /> : null}
                </button>
              ))}
              <label className="block rounded-2xl border border-black/10 bg-white p-4 text-sm">
                <span className="mb-2 block font-semibold">Or invite by email</span>
                <input
                  type="email"
                  value={typedEmail}
                  placeholder="athlete@email.com"
                  onChange={(event) => {
                    setTypedEmail(event.target.value);
                    setEmail(event.target.value.trim().toLowerCase());
                    setNotice("");
                  }}
                  className="w-full rounded-xl border border-black/10 px-3 py-2.5"
                />
              </label>
            </>
          ) : null}

          {screen === "type" ? (
            CATEGORIES.map((item) => {
              const selected = categoryId === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setCategoryId(item.id);
                    setDealType(item.types[0]);
                    if (!DEAL_TYPES.find((type) => type.id === item.types[0])?.requiresPlatforms) setPlatforms([]);
                    setNotice("");
                  }}
                  className={`flex w-full items-center gap-4 rounded-2xl border bg-white px-4 py-4 text-left ${selected ? "border-zinc-950" : "border-black/10"}`}
                >
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-zinc-100">
                    <CategoryIcon name={item.icon} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold">{item.title}</span>
                    <span className="mt-1 block text-sm text-black/55">{item.body}</span>
                  </span>
                  {selected ? <Check /> : <span className="text-black/30">›</span>}
                </button>
              );
            })
          ) : null}

          {screen === "details" ? (
            <section className="space-y-4 rounded-2xl border border-black/10 bg-white p-5">
              {category && category.types.length > 1 ? (
                <div>
                  <p className="text-sm font-semibold">Deliverable</p>
                  <div className="mt-2 grid gap-2 sm:grid-cols-2">
                    {category.types.map((id) => {
                      const item = DEAL_TYPES.find((type) => type.id === id);
                      if (!item) return null;
                      return (
                        <button
                          key={id}
                          type="button"
                          onClick={() => setDealType(id)}
                          className={`rounded-xl border px-3 py-3 text-left text-sm ${dealType === id ? "border-zinc-950 font-semibold" : "border-black/10"}`}
                        >
                          {item.name}
                          <span className="mt-1 block font-normal text-black/50">{item.detail}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-black/60">{type ? `${type.name}. ${type.detail}.` : ""}</p>
              )}
              {type?.requiresPlatforms ? (
                <div>
                  <p className="text-sm font-semibold">Platforms</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {PLATFORMS.map((platform) => {
                      const on = platforms.includes(platform.id);
                      return (
                        <button
                          key={platform.id}
                          type="button"
                          onClick={() => setPlatforms((current) => on ? current.filter((id) => id !== platform.id) : [...current, platform.id])}
                          className={`rounded-full px-3 py-1.5 text-sm font-semibold ${on ? "bg-zinc-950 text-white" : "border border-black/10"}`}
                        >
                          {platform.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : null}
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm">
                  <span className="mb-1 block font-semibold">Start</span>
                  <input type="datetime-local" value={startsAt} min={localInputValue(new Date())} onChange={(event) => setStartsAt(event.target.value)} className="w-full rounded-xl border border-black/10 px-3 py-2.5" />
                </label>
                <label className="block text-sm">
                  <span className="mb-1 block font-semibold">Deadline</span>
                  <input type="datetime-local" value={deadline} min={startsAt || localInputValue(new Date())} onChange={(event) => setDeadline(event.target.value)} className="w-full rounded-xl border border-black/10 px-3 py-2.5" />
                </label>
              </div>
              <label className="block text-sm">
                <span className="mb-1 block font-semibold">Notes</span>
                <textarea value={notes} rows={4} maxLength={2000} onChange={(event) => setNotes(event.target.value)} placeholder="What should the athlete deliver?" className="w-full rounded-xl border border-black/10 px-3 py-2.5" />
              </label>
            </section>
          ) : null}

          {screen === "compensation" ? (
            <section className="rounded-2xl border border-black/10 bg-white p-5">
              <label className="block text-sm">
                <span className="mb-1 block font-semibold">Compensation (USD)</span>
                <input
                  inputMode="decimal"
                  value={compensation}
                  onChange={(event) => setCompensation(event.target.value)}
                  placeholder="500"
                  className="w-full rounded-xl border border-black/10 px-3 py-2.5 text-lg"
                />
              </label>
              <p className="mt-3 text-sm text-black/55">You pay this full amount by card. The {feePercent}% fee comes out of it. The athlete is not billed.</p>
              {split ? (
                <dl className="mt-5 space-y-3 border-t border-black/5 pt-4 text-sm">
                  <Row label="Your charge" value={money(amount)} />
                  <Row label={`Platform fee (${feePercent}%)`} value={`−${money(split.platformFeeAmount)}`} />
                  <Row label="Athlete receives" value={money(split.athleteNetPayout)} strong />
                </dl>
              ) : null}
            </section>
          ) : null}

          {screen === "review" && split ? (
            <section className="rounded-2xl border border-black/10 bg-white p-5 text-sm">
              <h2 className="font-semibold">Review</h2>
              <dl className="mt-4 divide-y divide-black/5">
                <Row label="Athlete" value={athlete ? athlete.name : email} />
                <Row label="Deal" value={type?.name ?? "Deal"} />
                <Row label="Platforms" value={platforms.length ? platforms.map(platformName).join(", ") : "None"} />
                <Row label="Starts" value={startsAt ? formatWhen(startsAt) : "None"} />
                <Row label="Deadline" value={deadline ? formatWhen(deadline) : "None"} />
                <Row label="Your charge" value={money(amount)} />
                <Row label={`Platform fee (${feePercent}%)`} value={`−${money(split.platformFeeAmount)}`} />
                <Row label="Athlete receives" value={money(split.athleteNetPayout)} strong />
              </dl>
              {notes ? <p className="mt-4 whitespace-pre-wrap text-black/70">{notes}</p> : null}
              <p className="mt-4 text-black/55">Pay and invite charges the card and holds the funds until you approve the work. The athlete is invited after the charge succeeds.</p>
            </section>
          ) : null}
        </div>
      </div>

      <input type="hidden" name="dealType" value={dealType} />
      <input type="hidden" name="compensation" value={compensation} />
      <input type="hidden" name="startsAt" value={startsAt} />
      <input type="hidden" name="deadline" value={deadline} />
      <input type="hidden" name="athleteEmail" value={email} />
      <input type="hidden" name="notes" value={notes} />
      {platforms.map((id) => <input key={id} type="hidden" name={`platform_${id}`} value="on" />)}

      {notice ? <p className="mt-4 text-sm text-red-600">{notice}</p> : null}
      {screen === "review" && state.error ? <p className="mt-4 text-sm text-red-600">{state.error}</p> : null}

      <div className="mt-6 flex items-center justify-between">
        {screen === "athlete" ? (
          <Link href="/dashboard/deals" className="rounded-full border border-black/10 bg-white px-5 py-2.5 text-sm font-semibold">Back</Link>
        ) : (
          <button type="button" onClick={back} className="rounded-full border border-black/10 bg-white px-5 py-2.5 text-sm font-semibold">Back</button>
        )}
        {screen === "review" ? (
          <button disabled={pending} className="rounded-full bg-zinc-950 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60">
            {pending ? "Opening secure payment…" : "Pay and invite"}
          </button>
        ) : (
          <button type="button" onClick={continueFlow} className="rounded-full bg-zinc-950 px-5 py-2.5 text-sm font-semibold text-white">Continue →</button>
        )}
      </div>
    </form>
  );
}

function validate(
  screen: Screen,
  value: { email: string; categoryId: string; dealType: string; platforms: string[]; startsAt: string; deadline: string; compensation: string },
) {
  if (screen === "athlete" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.email)) return "Choose an athlete or enter an email.";
  if (screen === "type" && !value.categoryId) return "Choose a partnership type.";
  if (screen === "details") {
    const type = DEAL_TYPES.find((item) => item.id === value.dealType);
    if (!type) return "Choose a deliverable.";
    if (type.requiresPlatforms && value.platforms.length === 0) return "Choose at least one platform.";
    if (!value.startsAt) return "Choose a start date and time.";
    if (!value.deadline) return "Choose a deadline date and time.";
    const start = new Date(value.startsAt);
    const end = new Date(value.deadline);
    if (Number.isNaN(start.getTime())) return "Choose a start date and time.";
    if (Number.isNaN(end.getTime())) return "Choose a deadline date and time.";
    if (start.getTime() <= Date.now()) return "Start must be in the future.";
    if (end.getTime() <= start.getTime()) return "The deadline must be after the start.";
  }
  if (screen === "compensation") {
    const amount = Number(value.compensation);
    if (!Number.isFinite(amount) || amount <= 0) return "Enter a compensation greater than 0.";
  }
  return "";
}

function leftCopy(screen: Screen, name?: string) {
  if (screen === "athlete") return { title: "Who is this deal for?", body: "Choose an athlete on AthleteGum, or invite someone by email." };
  if (screen === "type") return { title: "What kind of partnership are you creating?", body: name ? `This deal is for ${name}. Choose the type that fits. You’ll add the details next.` : "Choose the deal type that fits. You’ll add the details next." };
  if (screen === "details") return { title: "Add the deal details.", body: "Set when the work starts, when it is due, and any notes the athlete should see." };
  if (screen === "compensation") return { title: "What will you pay?", body: "The platform fee comes out of this amount. It is not added on top." };
  return { title: "Review and fund.", body: "Check the deal, then pay by card to send the invitation." };
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={`flex items-start justify-between gap-4 py-2 ${strong ? "font-semibold" : ""}`}>
      <dt className={strong ? "" : "text-black/50"}>{label}</dt>
      <dd className="text-right">{value}</dd>
    </div>
  );
}

function Check() {
  return (
    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-zinc-950 text-white">
      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.4">
        <path d="m5 12 5 5L20 7" />
      </svg>
    </span>
  );
}

function CategoryIcon({ name }: { name: string }) {
  const common = { viewBox: "0 0 24 24", className: "h-5 w-5", fill: "none", stroke: "currentColor", strokeWidth: 1.7 };
  if (name === "phone") {
    return <svg {...common}><rect x="7" y="3" width="10" height="18" rx="2" /><path d="M10 18h4" /></svg>;
  }
  if (name === "calendar") {
    return <svg {...common}><rect x="4" y="5" width="16" height="15" rx="2" /><path d="M8 3v4M16 3v4M4 10h16" /></svg>;
  }
  if (name === "box") {
    return <svg {...common}><path d="M3 8l9-4 9 4-9 4z" /><path d="M3 8v8l9 4 9-4V8" /><path d="M12 12v8" /></svg>;
  }
  if (name === "handshake") {
    return <svg {...common}><path d="M8 13 4 9l3-3 4 4 2-2 3 3" /><path d="m14 11 3 3 3-3-3-3" /><path d="m8 13 2 2 4-4" /></svg>;
  }
  return <svg {...common}><circle cx="12" cy="12" r="8" /><path d="M12 8v8M8 12h8" /></svg>;
}

function platformName(id: string) {
  return PLATFORMS.find((item) => item.id === id)?.name ?? id;
}

function localInputValue(date: Date) {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function formatWhen(value: string) {
  return new Date(value).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });
}
