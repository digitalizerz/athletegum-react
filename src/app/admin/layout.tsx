import { requireUser } from "@/app/actions/auth";
import { WorkspaceFrame } from "@/components/athlete-workspace";
import { getStripe } from "@/lib/stripe";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireUser("admin");

  return (
    <WorkspaceFrame
      name={session.name}
      photo={null}
      subtitle="Platform control"
      unread={0}
      homeHref="/admin"
      notificationsHref="/admin/audit"
      settingsHref="/admin/account"
      settingsLabel="Password"
      status={getStripe() ? { ok: true, label: "Payments connected" } : { ok: false, label: "Payments not set up" }}
      items={[
        { href: "/admin", label: "Overview", icon: "home", exact: true },
        { href: "/admin/users", label: "Users", icon: "users" },
        { href: "/admin/athletes", label: "Athletes", icon: "athletes" },
        { href: "/admin/businesses", label: "Businesses", icon: "businesses" },
        { href: "/admin/deals", label: "Deals", icon: "deals" },
        { href: "/admin/payments", label: "Payments", icon: "earnings" },
        { href: "/admin/revenue", label: "Revenue", icon: "earnings" },
        { href: "/admin/fees", label: "Fees", icon: "billing" },
        { href: "/admin/audit", label: "Audit log", icon: "audit" },
      ]}
    >
      {children}
    </WorkspaceFrame>
  );
}
