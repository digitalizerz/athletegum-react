export function mailConfigured() {
  return Boolean(process.env.RESEND_API_KEY && process.env.MAIL_FROM);
}

export async function sendPasswordReset(to: string, link: string) {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.MAIL_FROM;
  if (!key || !from) return false;
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to,
      subject: "Reset your AthleteGum password",
      text: `Reset your AthleteGum password:\n${link}\n\nThis link expires in 30 minutes. If you did not ask for a reset, you can ignore this email.`,
    }),
  });
  return response.ok;
}
