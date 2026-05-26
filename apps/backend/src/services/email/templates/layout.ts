export function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export interface LayoutOptions {
  title: string;
  preheader?: string;
  body: string;
  footerNote?: string;
}

export function renderLayout({ title, preheader, body, footerNote }: LayoutOptions): string {
  const safeTitle = escapeHtml(title);
  const safePreheader = preheader ? escapeHtml(preheader) : '';
  const safeFooter = footerNote
    ? escapeHtml(footerNote)
    : 'You received this email because you have a TwinSpire account.';

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>${safeTitle}</title>
  </head>
  <body style="margin:0;padding:0;background:#f4f6fb;font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,sans-serif;color:#111827;">
    <div style="display:none;max-height:0;overflow:hidden;color:transparent;">${safePreheader}</div>
    <div style="max-width:560px;margin:0 auto;padding:32px 16px;">
      <div style="background:#e91b25;color:#fff;border-radius:8px 8px 0 0;padding:24px 32px;font-size:20px;font-weight:600;letter-spacing:-0.01em;">
        TwinSpire
      </div>
      <div style="background:#ffffff;border-radius:0 0 16px 16px;padding:32px;box-shadow:0 10px 30px rgba(17,24,39,0.08);">
        ${body}
      </div>
      <p style="margin:24px 32px 0;color:#6b7280;font-size:12px;line-height:1.6;">
        ${safeFooter}
      </p>
    </div>
  </body>
</html>`;
}

export function renderButton(label: string, url: string): string {
  return `<a href="${escapeHtml(url)}" style="display:inline-block;background:#e91b25;color:#ffffff;text-decoration:none;padding:14px 22px;border-radius:8px;font-weight:600;font-size:15px;">${escapeHtml(label)}</a>`;
}
