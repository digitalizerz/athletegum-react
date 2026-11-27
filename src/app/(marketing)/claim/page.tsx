import type { Metadata } from "next";
import Link from "next/link";
import { createHash } from "crypto";
import { claimListing } from "@/app/actions/directory";
import { AuthForm, Field } from "@/components/auth-form";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Claim your profile — AthleteGum" };
export const dynamic = "force-dynamic";

export default async function ClaimPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const token = (await searchParams).token ?? "";
  const listing = token
    ? await prisma.directoryListing.findUnique({ where: { claimTokenHash: createHash("sha256").update(token).digest("hex") } })
    : null;
  const open = Boolean(listing && listing.email && !listing.claimedUserId && listing.claimExpiresAt && listing.claimExpiresAt.getTime() > Date.now());

  return (
    <main className="px-6 py-16">
      {open && listing ? (
        <AuthForm action={claimListing} title="Claim your profile" subtitle={`${listing.name} · ${listing.teamOrSchool} · ${listing.sport}. Choose a password for ${listing.email}.`} submitLabel="Claim profile">
          <input type="hidden" name="token" value={token} />
          <Field label="Password" name="password" type="password" />
          <Field label="Confirm password" name="confirm" type="password" />
        </AuthForm>
      ) : (
        <div className="mx-auto w-full max-w-md border-2 border-white p-8 text-white">
          <h1 className="text-3xl font-bold">This link is not open</h1>
          <p className="mt-2 text-sm text-white/70">It may have expired, or this profile was already claimed. Ask AthleteGum to send a new link, or sign in if you already set a password.</p>
          <Link href="/athlete/login" className="mt-6 inline-flex underline">Athlete sign in</Link>
        </div>
      )}
    </main>
  );
}
