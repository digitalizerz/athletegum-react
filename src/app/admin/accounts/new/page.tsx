import { createAccount } from "@/app/actions/admin";
import { requireUser } from "@/app/actions/auth";
import { AdminBack, AdminHeader, AdminNotice, fieldClass } from "@/components/admin-ui";

export const dynamic = "force-dynamic";

export default async function NewAccountPage({ searchParams }: { searchParams: Promise<{ role?: string; error?: string }> }) {
  await requireUser("admin");
  const params = await searchParams;
  const role = params.role === "athlete" || params.role === "admin" ? params.role : "business";
  const input = fieldClass();
  const back = role === "athlete" ? "/admin/athletes" : role === "business" ? "/admin/businesses" : "/admin/users";
  const title = role === "athlete" ? "Add athlete" : role === "admin" ? "Add admin" : "Add business";

  return (
    <div>
      <AdminBack href={back} label="Back" />
      <div className="mt-3">
        <AdminHeader title={title} subtitle="This creates a sign-in. The password is the one they use on the login page." />
      </div>
      <AdminNotice error={params.error} />
      <form action={createAccount} className="mt-6 max-w-xl rounded-2xl border border-black/10 bg-white p-5">
        <label className="block text-sm font-medium">Role
          <select name="role" defaultValue={role} className={input}>
            <option value="business">Business</option>
            <option value="athlete">Athlete</option>
            <option value="admin">Admin</option>
          </select>
        </label>
        <label className="mt-4 block text-sm font-medium">Name<input name="name" className={input} /></label>
        <label className="mt-4 block text-sm font-medium">Email<input name="email" type="email" className={input} /></label>
        <label className="mt-4 block text-sm font-medium">Password<input name="password" type="password" className={input} /></label>
        <label className="mt-4 block text-sm font-medium">Company<input name="businessName" placeholder="Used for a business account" className={input} /></label>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-medium">Sport<input name="sport" placeholder="Athlete" className={input} /></label>
          <label className="block text-sm font-medium">School<input name="school" placeholder="Athlete" className={input} /></label>
        </div>
        <button className="mt-5 rounded-xl bg-zinc-950 px-4 py-2 text-sm font-semibold text-white">Create account</button>
      </form>
    </div>
  );
}
