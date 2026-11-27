import Link from "next/link";
import { requireUser } from "@/app/actions/auth";
import { AddAthleteWizard } from "./wizard";

export const dynamic = "force-dynamic";

export default async function NewAthletePage({ searchParams }: { searchParams: Promise<{ error?: string; created?: string; id?: string }> }) {
  await requireUser("admin");
  const query = await searchParams;
  if (query.created && query.id) {
    return (
      <div className="mx-auto max-w-md rounded-3xl border border-black/10 bg-white px-6 py-10 text-center">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-zinc-950 text-white">
          <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="m5 12 5 5L20 7" /></svg>
        </span>
        <h1 className="mt-4 text-2xl font-bold">Athlete added</h1>
        <p className="mt-2 text-sm text-zinc-500">{query.created} can sign in with the email and temporary password you set.</p>
        <div className="mt-6 flex justify-center gap-2">
          <Link href={`/admin/athletes/${query.id}`} className="inline-flex h-10 items-center rounded-xl bg-zinc-950 px-4 text-sm font-semibold text-white">View Profile</Link>
          <Link href="/admin/athletes/new" className="inline-flex h-10 items-center rounded-xl border border-black/10 px-4 text-sm font-semibold">Add Another Athlete</Link>
        </div>
      </div>
    );
  }
  return <AddAthleteWizard error={query.error} />;
}
