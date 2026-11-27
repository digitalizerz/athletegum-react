export type EmailContent = {
  preview: string;
  eyebrow: string;
  heading: string;
  greeting: string;
  paragraphs: string[];
  detail?: { title: string; meta: string };
  note?: string;
  buttonLabel: string;
  actionUrl: string;
  finePrint: string;
};

const font = "-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif";

function escapeHtml(value: string) {
  return value.replace(/[&<>"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[char] ?? char);
}

/** One shell for every AthleteGum email. Resend fills the {{{VARIABLE}}} slots. */
export const emailTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="dark">
  <title>{{{HEADING}}}</title>
</head>
<body style="margin:0;padding:0;background:#000000;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:#000000;">{{{PREVIEW_TEXT}}}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#000000;">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:560px;border:2px solid #ffffff;">
          <tr>
            <td style="padding:32px 32px 8px;font-family:${font};">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td width="32" height="32" align="center" valign="middle" bgcolor="#ffffff" style="width:32px;height:32px;background:#ffffff;color:#000000;font-family:${font};font-size:16px;font-weight:700;line-height:32px;">A</td>
                  <td style="padding-left:10px;font-family:${font};font-size:16px;font-weight:700;color:#ffffff;">AthleteGum</td>
                </tr>
              </table>
              <p style="margin:28px 0 8px;font-family:${font};font-size:12px;letter-spacing:0.16em;font-weight:700;color:#a3a3a3;">{{{EYEBROW}}}</p>
              <h1 style="margin:0 0 20px;font-family:${font};font-size:32px;line-height:38px;font-weight:700;color:#ffffff;">{{{HEADING}}}</h1>
              <p style="margin:0 0 16px;font-family:${font};font-size:16px;line-height:26px;color:#ffffff;">{{{GREETING}}}</p>
              {{{BODY_HTML}}}
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 20px;">
                <tr>
                  <td align="center" bgcolor="#ffffff" style="background:#ffffff;">
                    <a href="{{{ACTION_URL}}}" style="display:block;padding:16px 24px;font-family:${font};font-size:15px;font-weight:700;color:#000000;text-decoration:none;text-align:center;">{{{BUTTON_LABEL}}}</a>
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 8px;font-family:${font};font-size:13px;line-height:20px;color:#a3a3a3;">Or copy this link:</p>
              <p style="margin:0 0 20px;font-family:${font};font-size:13px;line-height:20px;word-break:break-all;"><a href="{{{ACTION_URL}}}" style="color:#ffffff;text-decoration:underline;">{{{ACTION_URL}}}</a></p>
              <p style="margin:0;font-family:${font};font-size:13px;line-height:20px;color:#a3a3a3;">{{{FINE_PRINT}}}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 32px 28px;border-top:1px solid #262626;font-family:${font};font-size:12px;line-height:18px;color:#737373;">
              <a href="https://www.athletegum.com" style="color:#a3a3a3;text-decoration:none;">athletegum.com</a>
              &nbsp;&middot;&nbsp;
              <a href="https://www.athletegum.com/privacy" style="color:#a3a3a3;text-decoration:none;">Privacy</a>
              &nbsp;&middot;&nbsp;
              <a href="https://www.athletegum.com/terms" style="color:#a3a3a3;text-decoration:none;">Terms</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

function bodyHtml(input: EmailContent) {
  const paragraphs = input.paragraphs
    .filter(Boolean)
    .map((paragraph) => `<p style="margin:0 0 16px;font-family:${font};font-size:16px;line-height:26px;color:#d4d4d4;">${escapeHtml(paragraph)}</p>`)
    .join("");
  const detail = input.detail
    ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px;border:1px solid #ffffff;">
        <tr>
          <td style="padding:16px 18px;font-family:${font};">
            <p style="margin:0;font-size:18px;line-height:24px;font-weight:700;color:#ffffff;">${escapeHtml(input.detail.title)}</p>
            <p style="margin:6px 0 0;font-size:14px;line-height:20px;color:#a3a3a3;">${escapeHtml(input.detail.meta)}</p>
          </td>
        </tr>
      </table>`
    : "";
  const note = input.note
    ? `<p style="margin:0 0 24px;font-family:${font};font-size:14px;line-height:22px;color:#a3a3a3;">${escapeHtml(input.note)}</p>`
    : "";
  return `${paragraphs}${detail}${note}`;
}

export function renderEmail(input: EmailContent) {
  const slots: Record<string, string> = {
    PREVIEW_TEXT: escapeHtml(input.preview),
    EYEBROW: escapeHtml(input.eyebrow),
    HEADING: escapeHtml(input.heading),
    GREETING: escapeHtml(input.greeting),
    BUTTON_LABEL: escapeHtml(input.buttonLabel),
    ACTION_URL: escapeHtml(input.actionUrl),
    FINE_PRINT: escapeHtml(input.finePrint),
    BODY_HTML: bodyHtml(input),
  };
  return emailTemplate.replace(/\{\{\{([A-Z_]+)\}\}\}/g, (match, key) => slots[key] ?? match);
}
