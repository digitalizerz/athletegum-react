import { markAllNotificationsRead, markNotificationRead } from "@/app/actions/notifications";
import { requireUser } from "@/app/actions/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AthleteNotificationsPage() {
  const session = await requireUser("athlete");
  const notes = await prisma.notification.findMany({
    where: { userId: session.id },
    orderBy: { createdAt: "desc" },
  });
  const unread = notes.filter((note) => !note.readAt).length;

  return (
    <div>
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Notifications</h1>
          <p className="mt-2 text-black/60">{unread} unread</p>
        </div>
        {unread > 0 ? (
          <form action={markAllNotificationsRead}>
            <button className="border border-black px-3 py-2 text-sm font-semibold">Mark all read</button>
          </form>
        ) : null}
      </div>
      <ul className="mt-8 space-y-3">
        {notes.length === 0 ? <li className="text-black/60">No notifications yet.</li> : null}
        {notes.map((note) => (
          <li key={note.id} className="rounded-2xl border border-black/10 bg-white px-4 py-3">
            <p className="font-semibold">{note.title}</p>
            <p className="mt-1 text-sm text-black/70">{note.body}</p>
            <div className="mt-3 flex gap-4 text-sm">
              {note.href ? <a href={note.href} className="font-semibold underline">Open</a> : null}
              {!note.readAt ? (
                <form action={markNotificationRead.bind(null, note.id)}>
                  <button className="text-black/60 underline">Mark read</button>
                </form>
              ) : (
                <span className="text-black/40">Read</span>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
