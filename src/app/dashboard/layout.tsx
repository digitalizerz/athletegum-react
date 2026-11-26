import { requireUser } from "@/app/actions/auth";
import { WorkspaceFrame } from "@/components/athlete-workspace";
import { effectivePlan } from "@/lib/deals";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function BusinessLayout({ children }: { children: React.ReactNode }) {
  const session = await requireUser("business");
  const auth = await getSession();
  const user = await prisma.user.findUnique({ where: { id: session.id } });
  const [unread, activeDeals] = await Promise.all([
    prisma.notification.count({ where: { userId: session.id, readAt: null } }),
    prisma.deal.count({ where: { businessId: session.id, status: { in: ["pending", "accepted", "completed"] } } }),
  ]);
  const plan = user ? effectivePlan(user.subscriptionPlan, user.subscriptionStatus) : "free";
  const planLabel = plan === "free" ? "Free plan" : plan === "pro" ? "Pro plan" : "Growth plan";

  return (
    <WorkspaceFrame
      name={user?.businessName || user?.name || session.name}
      photo={user?.profilePhoto ?? null}
      subtitle={`Business · ${planLabel}`}
      unread={unread}
      homeHref="/dashboard"
      notificationsHref="/dashboard/notifications"
      settingsHref="/dashboard/profile"
      settingsLabel="Company profile"
      upgrade={plan === "free" ? { href: "/dashboard/billing", title: "Upgrade to Pro", body: "More than 3 active deals, and a lower platform fee." } : null}
      impersonating={auth?.impersonatorId ? user?.businessName || user?.name || session.name : null}
      items={[
        { href: "/dashboard", label: "Overview", icon: "home", exact: true },
        { href: "/dashboard/deals", label: "Deals", icon: "deals", badge: activeDeals },
        { href: "/dashboard/athletes", label: "Athletes", icon: "athletes" },
        { href: "/dashboard/revenue", label: "Revenue", icon: "earnings" },
        { href: "/dashboard/billing", label: "Billing", icon: "billing" },
        { href: "/dashboard/messages", label: "Messages", icon: "messages" },
        { href: "/dashboard/profile", label: "Company Profile", icon: "profile" },
      ]}
    >
      {children}
    </WorkspaceFrame>
  );
}
