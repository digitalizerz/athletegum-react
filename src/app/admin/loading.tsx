export default function AdminLoading() {
  return (
    <div className="animate-pulse">
      <div className="h-8 w-56 rounded-lg bg-zinc-200" />
      <div className="mt-3 h-4 w-80 rounded bg-zinc-100" />
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="h-32 rounded-2xl border border-black/10 bg-white" />
        ))}
      </div>
    </div>
  );
}
