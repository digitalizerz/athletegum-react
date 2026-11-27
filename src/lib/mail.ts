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
  return Boolean((resendKey() || mailKey()) && fromAddress());
}

function resendKey() {
  return process.env.RESEND_API_KEY?.trim().replace(/^["']|["']$/g, "") ?? "";
}

function mailKey() {
  return process.env.SENDGRID_API_KEY?.trim().replace(/^["']|["']$/g, "").replace(/^Bearer\s+/i, "") ?? "";
}

function failureReason(status: number, body: string) {
  try {
    const parsed = JSON.parse(body) as { message?: string; errors?: { message?: string }[] };
    const message = parsed.message || parsed.errors?.map((error) => error.message).filter(Boolean).join(" ");
    if (message) return message.slice(0, 180);
  } catch {
    // SendGrid sometimes returns plain text.
  }
  if (status === 401) return "The email service rejected the API key.";
  if (status === 403) return "The email service refused this sender.";
  return `The email service returned ${status}.`;
}

async function postMail(host: string, from: From, to: string, subject: string, text: string) {
  const response = await fetch(`${host}/v3/mail/send`, {
    method: "POST",
    headers: { Authorization: `Bearer ${mailKey()}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: to }] }],
      from,
      reply_to: from,
      subject,
      content: [{ type: "text/plain", value: text }],
    }),
  });
  if (response.status === 202 || response.ok) return { ok: true as const, status: response.status, reason: "" };
  const body = await response.text();
  console.error("SendGrid rejected mail", host, response.status, body.slice(0, 500));
  return { ok: false as const, status: response.status, reason: failureReason(response.status, body) };
}

async function postResend(from: From, to: string, subject: string, text: string) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${resendKey()}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: `${from.name} <${from.email}>`,
      to: [to],
      reply_to: from.email,
      subject,
      text,
    }),
  });
  if (response.ok) return { ok: true as const, reason: "" };
  const body = await response.text();
  console.error("Resend rejected mail", response.status, body.slice(0, 500));
  return { ok: false as const, reason: failureReason(response.status, body) };
}

async function sendMail(to: string, subject: string, text: string) {
  const from = fromAddress();
  if (!from) return { ok: false, reason: "Email is not set up on this server yet." };
  if (resendKey()) return postResend(from, to, subject, text);
  const key = mailKey();
  if (!key) return { ok: false, reason: "Email is not set up on this server yet." };
  const hosts = ["https://api.sendgrid.com", "https://api.eu.sendgrid.com"];
  const senders = from.email.toLowerCase() === "business@athletegum.com" ? [from] : [from, { email: "business@athletegum.com", name: "AthleteGum" }];
  let reason = "The reset email could not be sent.";
  for (const host of hosts) {
    for (const sender of senders) {
      const result = await postMail(host, sender, to, subject, text);
      if (result.ok) return { ok: true, reason: "" };
      reason = result.reason;
    }
  }
  return { ok: false, reason };
}

async function deliver(to: string, subject: string, text: string) {
  return (await sendMail(to, subject, text)).ok;
}

export async function sendPasswordReset(to: string, link: string, name?: string) {
  const greeting = name ? `Hi ${name.split(" ")[0]},` : "Hi,";
  return sendMail(
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
