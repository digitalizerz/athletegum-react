import { dashboardLink, onboardingLink } from "@/lib/connect";
import { appOrigin } from "@/lib/app-origin";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session || session.role !== "athlete") redirect("/athlete/login");
  const purpose = new URL(request.url).searchParams.get("purpose");
  const origin = await appOrigin();
  let url = "/athlete/earnings?setup=error&reason=failed";
  try {
    url = purpose === "dashboard" ? await dashboardLink(session.id, origin) : await onboardingLink(session.id, origin);
  } catch (error) {
    console.error(error);
  }
  redirect(url);
}
