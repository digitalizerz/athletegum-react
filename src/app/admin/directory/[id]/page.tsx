import Link from "next/link";
import { notFound } from "next/navigation";
import { sendClaimInviteToListing, updateListing } from "@/app/actions/directory";
import { requireUser } from "@/app/actions/auth";
import { DeleteListingButton } from "@/components/admin-controls";
import { AthleteAvatar } from "@/components/athlete-avatar";
import { AdminNotice, fieldClass } from "@/components/admin-ui";
import { listingCompletion } from "@/components/admin-profiles";
import { DIRECTORY_LEVELS, DIRECTORY_SPORTS, DIRECTORY_SQUADS, directoryLevelLabel, placeLabel, squadLabel } from "@/lib/directory";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function DirectoryListingPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ edit?: string; saved?: string; error?: string; link?: string }> }) {
  await requireUser("admin");
  const { id } = await params;
  const query = await searchParams;
  const editing = query.edit === "1";
  const listing = await prisma.directoryListing.findUnique({
    where: { id },
    include: { interests: { orderBy: { createdAt: "desc" }, include: { business: true } }, claimedUser: true },
  });
  if (!listing) notFound();
  const completion = listingCompletion(listing);
  const sportLine = [listing.teamOrSchool, squadLabel(listing.squad), listing.sport].filter(Boolean).join(" · ");

  return (
    <div>
      <p className="text-sm text-zinc-500">
        <Link href="/admin/directory" className="hover:text-black">Directory</Link>
        <span className="px-1.5">/</span>
        <span className="text-zinc-800">{listing.name}</span>
      </p>
      <section className="mt-4 rounded-3xl border border-black/10 bg-white p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <AthleteAvatar name={listing.name} photo={null} size={72} />
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{listing.name}</h1>
              <p className="mt-1 text-sm text-zinc-500">{sportLine}</p>
              <div className="mt-2 flex flex-wrap gap-2 text-xs font-medium">
                <span className="rounded-full bg-zinc-100 px-2.5 py-1">{directoryLevelLabel(listing.level)}</span>
                <span className="rounded-full bg-zinc-100 px-2.5 py-1">{listing.claimedUserId ? "Claimed" : "Listed"}</span>
                <span className="rounded-full bg-zinc-100 px-2.5 py-1">No login</span>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <DeleteListingButton listingId={listing.id} name={listing.name} interests={listing.interests.length} />
            <Link href={editing ? `/admin/directory/${listing.id}` : `/admin/directory/${listing.id}?edit=1`} className="inline-flex h-10 items-center rounded-xl bg-zinc-950 px-4 text-sm font-semibold text-white">
              {editing ? "Close editor" : "Edit profile"}
            </Link>
            {listing.claimedUser ? (
              <Link href={`/admin/athletes/${listing.claimedUser.id}`} className="inline-flex h-10 items-center rounded-xl border border-black/10 px-4 text-sm font-semibold">Open account</Link>
            ) : null}
          </div>
        </div>
        <AdminNotice saved={query.saved === "1" ? "Saved." : query.saved} error={query.error} />
        {query.link ? <p className="mt-3 break-all rounded-xl bg-zinc-50 px-3 py-2 text-sm">{query.link}</p> : null}
        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Mini label="Profile completion" value={`${completion}%`} hint="Name, team, place, position, squad" />
          <Mini label="Storefront" value="Off" hint="Listings do not have a storefront" />
          <Mini label="Interest" value={String(listing.interests.length)} hint="Businesses waiting on a reply" />
          <Mini label="Earnings" value="$0.00" hint="No account, so nothing can be paid" />
        </div>
      </section>

      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-4">
          <ClaimCard listing={listing} />
          {editing ? <ListingEditor listing={listing} /> : (
            <>
              <Card title="Basic information">
                <Row label="Full name" value={listing.name} />
                <Row label="Email" value="No login on this listing" />
                <Row label="Location" value={placeLabel(listing.city, listing.state) || "—"} />
              </Card>
              <Card title="Athletic information">
                <Row label="Level" value={directoryLevelLabel(listing.level)} />
                <Row label="School" value={listing.teamOrSchool} />
                <Row label="Sport" value={listing.sport} />
                <Row label="Squad" value={squadLabel(listing.squad) || "—"} />
                <Row label="Position" value={listing.position || "—"} />
              </Card>
              <Card title="Profile & visibility">
                <Row label="Profile status" value={listing.status === "listed" ? "Visible to businesses" : listing.status} />
                <Row label="Storefront" value="Off" />
                <Row label="Paid deals" value={listing.level === "high_school" ? "Not allowed" : "After they claim an account"} />
              </Card>
            </>
          )}
        </div>
        <section className="rounded-2xl border border-black/10 bg-white p-5">
          <h2 className="font-semibold">Introduction requests</h2>
          {listing.interests.length === 0 ? <p className="mt-3 text-sm text-zinc-500">No business has asked about {listing.name} yet.</p> : null}
          <ul className="mt-3 space-y-3 text-sm">
            {listing.interests.map((interest) => (
              <li key={interest.id}>
                <p className="font-medium">{interest.business.businessName || interest.business.name}</p>
                <p className="text-xs text-zinc-500">{interest.note || "No note"} · {interest.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

function ClaimCard({ listing }: { listing: { id: string; email: string | null; claimedUserId: string | null; claimExpiresAt: Date | null; claimedUser: { id: string; email: string } | null } }) {
  const input = fieldClass();
  if (listing.claimedUser) {
    return (
      <section className="rounded-2xl border border-black/10 bg-white p-5">
        <h2 className="font-semibold">Account claimed</h2>
        <p className="mt-2 text-sm text-zinc-500">{listing.claimedUser.email} can sign in and open this profile.</p>
        <Link href={`/admin/athletes/${listing.claimedUser.id}`} className="mt-4 inline-flex h-10 items-center rounded-xl bg-zinc-950 px-4 text-sm font-semibold text-white">Open account</Link>
      </section>
    );
  }
  const pending = listing.email && listing.claimExpiresAt && listing.claimExpiresAt.getTime() > Date.now();
  return (
    <form action={sendClaimInviteToListing.bind(null, listing.id)} className="rounded-2xl border border-black/10 bg-white p-5">
      <h2 className="font-semibold">Send a claim link</h2>
      <p className="mt-1 text-sm text-zinc-500">Add the email they gave you. They get a link to set a password and take over this profile. You do not choose the password.</p>
      <label className="mt-4 block text-sm font-medium">Email
        <input name="email" type="email" required defaultValue={listing.email ?? ""} className={input} />
      </label>
      {pending ? <p className="mt-3 text-xs text-zinc-500">A link is already out to {listing.email}. It expires {listing.claimExpiresAt?.toLocaleDateString("en-US", { month: "short", day: "numeric" })}. Sending again replaces it.</p> : null}
      <button className="mt-4 rounded-xl bg-zinc-950 px-4 py-2 text-sm font-semibold text-white">{pending ? "Send a new link" : "Email claim link"}</button>
    </form>
  );
}

function ListingEditor({ listing }: { listing: { id: string; name: string; level: string; sport: string; squad: string | null; position: string | null; teamOrSchool: string; city: string | null; state: string | null } }) {
  const input = fieldClass();
  return (
    <form action={updateListing.bind(null, listing.id)} className="rounded-2xl border border-black/10 bg-white p-5">
      <h2 className="font-semibold">Edit listing</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-medium">Name<input name="name" required defaultValue={listing.name} className={input} /></label>
        <label className="block text-sm font-medium">Level
          <select name="level" defaultValue={listing.level} className={input}>
            {DIRECTORY_LEVELS.map((level) => <option key={level.id} value={level.id}>{level.label}</option>)}
          </select>
        </label>
        <label className="block text-sm font-medium">Sport
          <input name="sport" required defaultValue={listing.sport} list="directory-sports" className={input} />
          <datalist id="directory-sports">{DIRECTORY_SPORTS.map((sport) => <option key={sport} value={sport} />)}</datalist>
        </label>
        <label className="block text-sm font-medium">Squad
          <select name="squad" defaultValue={listing.squad ?? ""} className={input}>
            <option value="">Not set</option>
            {DIRECTORY_SQUADS.map((squad) => <option key={squad.id} value={squad.id}>{squad.label}</option>)}
          </select>
        </label>
        <label className="block text-sm font-medium">Position<input name="position" defaultValue={listing.position ?? ""} className={input} /></label>
        <label className="block text-sm font-medium">Team or school<input name="teamOrSchool" required defaultValue={listing.teamOrSchool} className={input} /></label>
        <label className="block text-sm font-medium">City<input name="city" defaultValue={listing.city ?? ""} className={input} /></label>
        <label className="block text-sm font-medium">State<input name="state" defaultValue={listing.state ?? ""} className={input} /></label>
      </div>
      <button className="mt-5 rounded-xl bg-zinc-950 px-4 py-2 text-sm font-semibold text-white">Save changes</button>
    </form>
  );
}

function Mini({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="rounded-2xl border border-black/5 bg-zinc-50 px-4 py-3">
      <p className="text-xs text-zinc-500">{label}</p>
      <p className="mt-1 text-xl font-semibold">{value}</p>
      <p className="mt-1 text-xs text-zinc-400">{hint}</p>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-black/10 bg-white p-5">
      <h2 className="font-semibold">{title}</h2>
      <dl className="mt-3 divide-y divide-black/5 text-sm">{children}</dl>
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 py-2.5">
      <dt className="text-zinc-500">{label}</dt>
      <dd className="text-right font-medium">{value}</dd>
    </div>
  );
}
