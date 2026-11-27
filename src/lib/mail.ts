import { renderEmail, type EmailContent } from "@/lib/email-layout";

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

async function postMail(host: string, from: From, to: string, subject: string, text: string, html?: string) {
  const content = [{ type: "text/plain", value: text }, ...(html ? [{ type: "text/html", value: html }] : [])];
  const response = await fetch(`${host}/v3/mail/send`, {
    method: "POST",
    headers: { Authorization: `Bearer ${mailKey()}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: to }] }],
      from,
      reply_to: from,
      subject,
      content,
    }),
  });
  if (response.status === 202 || response.ok) return { ok: true as const, status: response.status, reason: "" };
  const body = await response.text();
  console.error("SendGrid rejected mail", host, response.status, body.slice(0, 500));
  return { ok: false as const, status: response.status, reason: failureReason(response.status, body) };
}

async function postResend(from: From, to: string, subject: string, text: string, html?: string) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${resendKey()}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: `${from.name} <${from.email}>`,
      to: [to],
      reply_to: from.email,
      subject,
      text,
      ...(html ? { html } : {}),
    }),
  });
  if (response.ok) return { ok: true as const, reason: "" };
  const body = await response.text();
  console.error("Resend rejected mail", response.status, body.slice(0, 500));
  return { ok: false as const, reason: failureReason(response.status, body) };
}

async function sendMail(to: string, subject: string, text: string, html?: string) {
  const from = fromAddress();
  if (!from) return { ok: false, reason: "Email is not set up on this server yet." };
  if (resendKey()) return postResend(from, to, subject, text, html);
  const key = mailKey();
  if (!key) return { ok: false, reason: "Email is not set up on this server yet." };
  const hosts = ["https://api.sendgrid.com", "https://api.eu.sendgrid.com"];
  const senders = from.email.toLowerCase() === "business@athletegum.com" ? [from] : [from, { email: "business@athletegum.com", name: "AthleteGum" }];
  let reason = "The reset email could not be sent.";
  for (const host of hosts) {
    for (const sender of senders) {
      const result = await postMail(host, sender, to, subject, text, html);
      if (result.ok) return { ok: true, reason: "" };
      reason = result.reason;
    }
  }
  return { ok: false, reason };
}

async function deliver(to: string, subject: string, content: EmailContent) {
  const text = [
    content.greeting,
    "",
    ...content.paragraphs,
    content.detail ? `${content.detail.title}, ${content.detail.meta}` : "",
    content.note ?? "",
    "",
    `${content.buttonLabel}: ${content.actionUrl}`,
    "",
    content.finePrint,
  ]
    .filter((line) => line !== "")
    .join("\n");
  return (await sendMail(to, subject, text, renderEmail(content))).ok;
}

export async function sendPasswordReset(to: string, link: string, name?: string) {
  const first = name?.split(" ")[0];
  const content: EmailContent = {
    preview: "Choose a new AthleteGum password. This link expires in 30 minutes.",
    eyebrow: "ACCOUNT",
    heading: "Reset your password",
    greeting: first ? `Hi ${first},` : "Hi,",
    paragraphs: ["Use the button below to choose a new password."],
    buttonLabel: "Choose a new password",
    actionUrl: link,
    finePrint: "This link expires in 30 minutes. If you did not ask for a reset, you can ignore this email.",
  };
  return sendMail(to, "Reset your AthleteGum password", `${content.greeting}\n\nReset your AthleteGum password:\n${link}\n\n${content.finePrint}`, renderEmail(content));
}

export async function sendClaimInvite(to: string, name: string, school: string, sport: string, link: string, highSchool: boolean) {
  const first = name.split(" ")[0] || name;
  return deliver(to, "Claim your AthleteGum profile", {
    preview: "Your AthleteGum profile is ready. Set a password to claim it.",
    eyebrow: "ATHLETE PROFILE",
    heading: "Claim your profile",
    greeting: `Hi ${first},`,
    paragraphs: ["AthleteGum has a profile ready for you. Set a password to claim it."],
    detail: { title: name, meta: [school, sport].filter(Boolean).join(" · ") },
    note: highSchool ? "This profile is for introductions. High school athletes are not paid through a deal." : undefined,
    buttonLabel: "Claim your profile",
    actionUrl: link,
    finePrint: "This link expires in 7 days. If you were not expecting this, you can ignore this email.",
  });
}

export async function sendDealInvitation(to: string, athleteName: string, businessName: string, dealName: string, amount: string, link: string) {
  return deliver(to, "You've received a new deal", {
    preview: `${businessName} invited you to a ${dealName} deal for ${amount}.`,
    eyebrow: "DEAL",
    heading: "You've received a new deal",
    greeting: `Hi ${athleteName},`,
    paragraphs: [`${businessName} invited you to a ${dealName} deal for ${amount}. The card payment is already held.`],
    buttonLabel: "Open the deal",
    actionUrl: link,
    finePrint: "The payment stays held until the work is approved.",
  });
}

export async function sendDealAccepted(to: string, businessName: string, athleteName: string, dealName: string, link: string) {
  return deliver(to, "Deal accepted by athlete", {
    preview: `${athleteName} accepted your ${dealName} deal.`,
    eyebrow: "DEAL",
    heading: "Deal accepted",
    greeting: `Hi ${businessName},`,
    paragraphs: [`${athleteName} accepted your ${dealName} deal.`],
    buttonLabel: "Open the deal",
    actionUrl: link,
    finePrint: "You can follow the work from the deal page.",
  });
}

export async function sendDeliverablesSubmitted(to: string, businessName: string, athleteName: string, dealName: string, link: string) {
  return deliver(to, "Deliverables submitted for review", {
    preview: `${athleteName} submitted work for your ${dealName} deal.`,
    eyebrow: "DEAL",
    heading: "Work is ready to review",
    greeting: `Hi ${businessName},`,
    paragraphs: [`${athleteName} submitted work for your ${dealName} deal.`],
    buttonLabel: "Review the work",
    actionUrl: link,
    finePrint: "Nothing is paid out until you approve it.",
  });
}

export async function sendRevisionsRequested(to: string, athleteName: string, dealName: string, notes: string, link: string) {
  return deliver(to, "Revisions requested on your submission", {
    preview: `Revisions were requested on your ${dealName} deal.`,
    eyebrow: "DEAL",
    heading: "Revisions requested",
    greeting: `Hi ${athleteName},`,
    paragraphs: [`Revisions were requested on your ${dealName} deal.`, notes],
    buttonLabel: "Open the deal",
    actionUrl: link,
    finePrint: "Update the work and submit it again.",
  });
}
