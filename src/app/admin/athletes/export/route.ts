import { requireUser } from "@/app/actions/auth";
import { accountCompletion } from "@/components/admin-profiles";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  await requireUser("admin");
  const url = new URL(request.url);
  const q = url.searchParams.get("q")?.trim().toLowerCase() ?? "";
  const sport = url.searchParams.get("sport") ?? "";
  const status = url.searchParams.get("status") ?? "";
  const athletes = await prisma.user.findMany({ where: { role: "athlete" }, orderBy: { name: "asc" } });
  const rows = athletes.filter((athlete) => {
    if (q && ![athlete.name, athlete.email, athlete.sport, athlete.school].join(" ").toLowerCase().includes(q)) return false;
    if (sport && athlete.sport !== sport) return false;
    if (status === "active" && !athlete.isActive) return false;
    if (status === "inactive" && athlete.isActive) return false;
    return true;
  });
  const lines = [
    ["Name", "Email", "School", "Sport", "Level", "City", "Status", "Profile completion"].join(","),
    ...rows.map((athlete) =>
      [athlete.name, athlete.email, athlete.school ?? "", athlete.sport ?? "", athlete.athleteLevel ?? "", athlete.city ?? "", athlete.isActive ? "Active" : "Inactive", `${accountCompletion(athlete)}%`]
        .map(csv)
        .join(","),
    ),
  ];
  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": "attachment; filename=athlete-profiles.csv",
    },
  });
}

function csv(value: string) {
  return `"${value.replaceAll('"', '""')}"`;
}
