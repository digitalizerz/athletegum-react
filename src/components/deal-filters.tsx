"use client";

export function DealFilters({
  q,
  status,
  platform,
  athlete,
  sort,
  platforms,
  athletes,
}: {
  q: string;
  status: string;
  platform: string;
  athlete: string;
  sort: string;
  platforms: { id: string; name: string }[];
  athletes: string[];
}) {
  return (
    <form action="/dashboard/deals" className="flex flex-wrap items-center gap-2">
      <input
        name="q"
        defaultValue={q}
        placeholder="Search deals, athletes, or notes"
        className="h-11 min-w-56 flex-1 rounded-full border border-black/10 bg-white px-4 text-sm outline-none"
      />
      <select name="status" defaultValue={status} onChange={(event) => event.currentTarget.form?.requestSubmit()} className="h-11 rounded-full border border-black/10 bg-white px-4 text-sm">
        <option value="all">All statuses</option>
        <option value="pending">Waiting for athlete</option>
        <option value="accepted">In progress</option>
        <option value="completed">In review</option>
        <option value="approved">Approved</option>
        <option value="draft">Not charged</option>
        <option value="cancelled">Cancelled</option>
      </select>
      <select name="platform" defaultValue={platform} onChange={(event) => event.currentTarget.form?.requestSubmit()} className="h-11 rounded-full border border-black/10 bg-white px-4 text-sm">
        <option value="all">All platforms</option>
        {platforms.map((item) => (
          <option key={item.id} value={item.id}>{item.name}</option>
        ))}
      </select>
      <select name="athlete" defaultValue={athlete} onChange={(event) => event.currentTarget.form?.requestSubmit()} className="h-11 rounded-full border border-black/10 bg-white px-4 text-sm">
        <option value="all">All athletes</option>
        {athletes.map((name) => (
          <option key={name} value={name}>{name}</option>
        ))}
      </select>
      <select name="sort" defaultValue={sort} onChange={(event) => event.currentTarget.form?.requestSubmit()} className="h-11 rounded-full border border-black/10 bg-white px-4 text-sm">
        <option value="newest">Newest</option>
        <option value="oldest">Oldest</option>
        <option value="amount">Highest amount</option>
      </select>
    </form>
  );
}
