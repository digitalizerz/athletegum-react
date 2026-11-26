"use client";

export function AthleteOpportunityFilters({
  q,
  type,
  pay,
  sort,
  types,
}: {
  q: string;
  type: string;
  pay: string;
  sort: string;
  types: { id: string; name: string }[];
}) {
  return (
    <form action="/athlete/opportunities" className="flex flex-wrap items-center gap-2">
      <input
        name="q"
        defaultValue={q}
        placeholder="Search invitations"
        className="h-11 min-w-56 flex-1 rounded-full border border-black/10 bg-white px-4 text-sm outline-none"
      />
      <select name="type" defaultValue={type} onChange={(event) => event.currentTarget.form?.requestSubmit()} className="h-11 rounded-full border border-black/10 bg-white px-4 text-sm">
        <option value="all">All types</option>
        {types.map((item) => (
          <option key={item.id} value={item.id}>{item.name}</option>
        ))}
      </select>
      <select name="pay" defaultValue={pay} onChange={(event) => event.currentTarget.form?.requestSubmit()} className="h-11 rounded-full border border-black/10 bg-white px-4 text-sm">
        <option value="all">All compensation</option>
        <option value="under-500">Under $500</option>
        <option value="500-1500">$500 – $1,500</option>
        <option value="over-1500">Over $1,500</option>
      </select>
      <select name="sort" defaultValue={sort} onChange={(event) => event.currentTarget.form?.requestSubmit()} className="h-11 rounded-full border border-black/10 bg-white px-4 text-sm">
        <option value="newest">Newest</option>
        <option value="oldest">Oldest</option>
        <option value="amount">Highest payout</option>
      </select>
    </form>
  );
}
