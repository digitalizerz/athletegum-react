type From = { email: string; name: string };

function fromAddress(): From | null {
  const raw = process.env.MAIL_FROM?.trim() || "AthleteGum <notifications@athletegum.com>";
  const named = raw.match(/^(.*)<([^>]+)>$/);
  if (named) {
    const email = named[2].trim();
    if (!email.includes("@")) return null;
    return { email, name: named[1].trim().replace(/^"|"$/g, "") || "AthleteGum" };
  }
  if (!raw.includes("@")) return null;
  return { email: raw, name: "AthleteGum" };
}

export function mailConfigured() {
  return Boolean(process.env.SENDGRID_API_KEY && fromAddress());
}

async function deliver(to: string, subject: string, text: string) {
  const key = process.env.SENDGRID_API_KEY;
  const from = fromAddress();
  if (!key || !from) return false;
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
  return response.status === 202 || response.ok;
}

export async function sendPasswordReset(to: string, link: string, name?: string) {
  const greeting = name ? `Hi ${name.split(" ")[0]},` : "Hi,";
  return deliver(
    to,
    "Reset your AthleteGum password",
    `${greeting}\n\nReset your AthleteGum password:\n${link}\n\nThis link expires in 30 minutes. If you did not ask for a reset, you can ignore this email.`,
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
