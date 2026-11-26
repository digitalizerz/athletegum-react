import { accountSessionClientSecret } from "@/lib/connect";
import { getSession } from "@/lib/session";

export const runtime = "nodejs";

export async function POST() {
  const session = await getSession();
  if (!session || session.role !== "athlete") return Response.json({ error: "Sign in as an athlete first." }, { status: 401 });
  try {
    const clientSecret = await accountSessionClientSecret(session.id);
    return Response.json({ clientSecret });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Payout setup could not be opened." }, { status: 500 });
  }
}
