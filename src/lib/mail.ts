type From = { email: string; name: string };

function fromAddress(): From | null {
  const raw = (process.env.MAIL_FROM?.trim() || "AthleteGum <notifications@athletegum.com>").replace(/^["']|["']$/g, "");
  const named = raw.match(/^(.*?)\s*<\s*([^>\s]+@[^>\s]+)\s*>\s*$/);
  if (named) {
    return { email: named[2].trim(), name: named[1].trim().replace(/^["']|["']$/g, "") || "AthleteGum" };
  }
  const email = raw.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0];
  if (!email) return null;
  return { email, name: "AthleteGum" };
}

export function mailConfigured() {
  return Boolean(process.env.SENDGRID_API_KEY && fromAddress());
}

async function postMail(from: From, to: string, subject: string, text: string) {
  const key = process.env.SENDGRID_API_KEY;
  if (!key) return false;
  const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: to }] }],
      from,
      reply_to: { email: "business@athletegum.com", name: "AthleteGum" },
      subject,
      content: [{ type: "text/plain", value: text }],
    }),
  });
  if (response.status === 202 || response.ok) return true;
  const body = await response.text();
  console.error("SendGrid rejected mail", response.status, body.slice(0, 500));
  return false;
}

async function deliver(to: string, subject: string, text: string) {
  const from = fromAddress();
  if (!process.env.SENDGRID_API_KEY || !from) return false;
  if (await postMail(from, to, subject, text)) return true;
  if (from.email.toLowerCase() === "business@athletegum.com") return false;
  return postMail({ email: "business@athletegum.com", name: "AthleteGum" }, to, subject, text);
}

export async function sendPasswordReset(to: string, link: string, name?: string) {
  const greeting = name ? `Hi ${name.split(" ")[0]},` : "Hi,";
  return deliver(
    to,
    "Reset your AthleteGum password",
    `${greeting}\n\nReset your AthleteGum password:\n${link}\n\nThis link expires in 30 minutes. If you did not ask for a reset, you can ignore this email.`,
  );
}

export async function sendClaimInvite(to: string, name: string, school: string, sport: string, link: string, highSchool: boolean) {
  const first = name.split(" ")[0] || name;
  const extra = highSchool ? "\n\nThis profile is for introductions. High school athletes are not paid through a deal.\n" : "\n";
  return deliver(
    to,
    "Claim your AthleteGum profile",
    `Hi ${first},\n\nAthleteGum has a profile ready for you: ${name}, ${school}, ${sport}.\n\nSet your password and claim it:\n${link}\n${extra}\nThis link expires in 7 days. If you were not expecting this, you can ignore this email.`,
  );
}

export async function sendDealInvitation(to: string, athleteName: string, businessName: string, dealName: string, amount: string, link: string) {
  return deliver(
    to,
    "You've received a new deal",
    `Hi ${athleteName},\n\n${businessName} invited you to a ${dealName} deal for ${amount}. The card payment is already held.\n\nOpen the deal:\n${link}`,
  );
}

export async function sendDealAccepted(to: string, businessName: string, athleteName: string, dealName: string, link: string) {
  return deliver(
    to,
    "Deal accepted by athlete",
    `Hi ${businessName},\n\n${athleteName} accepted your ${dealName} deal.\n\nOpen the deal:\n${link}`,
  );
}

export async function sendDeliverablesSubmitted(to: string, businessName: string, athleteName: string, dealName: string, link: string) {
  return deliver(
    to,
    "Deliverables submitted for review",
    `Hi ${businessName},\n\n${athleteName} submitted work for your ${dealName} deal.\n\nReview it:\n${link}`,
  );
}

export async function sendRevisionsRequested(to: string, athleteName: string, dealName: string, notes: string, link: string) {
  return deliver(
    to,
    "Revisions requested on your submission",
    `Hi ${athleteName},\n\nRevisions were requested on your ${dealName} deal:\n\n${notes}\n\nOpen the deal:\n${link}`,
  );
}
