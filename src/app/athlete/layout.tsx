import { requireUser } from "@/app/actions/auth";
import { AthleteWorkspace } from "@/components/athlete-workspace";
import { prisma } from "@/lib/prisma";
import { levelLabel } from "@/lib/profile";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function AthleteLayout({ children }: { children: React.ReactNode }) {
  const session = await requireUser("athlete");
  const auth = await getSession();
  const user = await prisma.user.findUnique({ where: { id: session.id } });
  const [unread, pendingDeals] = await Promise.all([
    prisma.notification.count({ where: { userId: session.id, readAt: null } }),
    prisma.deal.count({
      where: {
        status: "pending",
        OR: [{ athleteId: session.id }, { invitations: { some: { athleteEmail: session.email } } }],
      },
    }),
  ]);
  const missing = profileGaps(user);
  const subtitle = [user?.sport, user?.school].filter(Boolean).join(" · ") || levelLabel(user?.athleteLevel);

  return (
    <AthleteWorkspace
      name={user?.name ?? session.name}
      photo={user?.profilePhoto ?? null}
      subtitle={subtitle}
      pendingDeals={pendingDeals}
      unread={unread}
      profilePrompt={null}
      upgrade={{
        href: "/athlete/profile",
        title: "Build your brand",
        body: missing.length ? `Add ${missing.join(", ")} so businesses know who they are hiring.` : "Your public profile is the page businesses open.",
        action: "Edit profile",
      }}
      impersonating={auth?.impersonatorId ? user?.name ?? session.name : null}
    >
      {children}
    </AthleteWorkspace>
  );
}

function profileGaps(user: { profilePhoto: string | null; school: string | null; bio: string | null; instagramHandle: string | null; tiktokHandle: string | null; twitterHandle: string | null; youtubeHandle: string | null } | null) {
  if (!user) return ["your details"];
  const gaps: string[] = [];
  if (!user.profilePhoto) gaps.push("a photo");
  if (!user.school) gaps.push("your school");
  if (!user.bio) gaps.push("a bio");
  if (!user.instagramHandle && !user.tiktokHandle && !user.twitterHandle && !user.youtubeHandle) gaps.push("a social link");
  return gaps;
}
