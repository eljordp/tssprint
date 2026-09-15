const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[c])
// Table layout and inline styles keep the brand readable in Gmail and Outlook.
export function brandedEmail({ preview, eyebrow, title, body, actionUrl, actionLabel }) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escape(title)}</title></head>
<body style="margin:0;padding:0;background:#f1f3f4;color:#15191d;font-family:Arial,Helvetica,sans-serif;-webkit-text-size-adjust:100%">
<div style="display:none;max-height:0;overflow:hidden;mso-hide:all">${escape(preview)}</div>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f1f3f4"><tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="600" cellspacing="0" cellpadding="0" style="width:100%;max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden">
<tr><td style="padding:28px 32px;background:#101418;border-bottom:4px solid #48bfee"><a href="https://tssprint.com" style="text-decoration:none"><img src="https://tssprint.com/brand/sticker-smith-logo.png" width="172" height="88" alt="The Sticker Smith" style="display:block;width:172px;height:88px;border:0;color:#ffffff"></a><p style="margin:16px 0 0;color:#c3cbd1;font-size:11px;line-height:18px;font-weight:bold;letter-spacing:1.6px">CUSTOM PRINT. MADE IN HAYWARD.</p></td></tr>
<tr><td style="padding:32px"><p style="margin:0 0 12px;color:#167397;font-size:11px;font-weight:bold;letter-spacing:1.5px;text-transform:uppercase">${escape(eyebrow)}</p><h1 style="margin:0 0 20px;font-size:30px;line-height:36px;letter-spacing:-0.6px;font-weight:800;color:#101418">${escape(title)}</h1>
<div style="font-size:16px;line-height:25px;color:#39444d">${body}</div>
${actionUrl ? `<table role="presentation" cellspacing="0" cellpadding="0" style="margin-top:24px"><tr><td bgcolor="#48bfee" style="border-radius:8px"><a href="${escape(actionUrl)}" style="display:inline-block;padding:15px 24px;color:#101418;font-size:15px;font-weight:bold;text-decoration:none;border-radius:8px">${escape(actionLabel)}</a></td></tr></table>` : ''}
</td></tr><tr><td style="padding:22px 32px;border-top:1px solid #e8ecef;font-size:12px;line-height:20px;color:#68747d">The Sticker Smith · Hayward, California<br><a href="https://tssprint.com" style="color:#167397;text-decoration:underline">tssprint.com</a> · <a href="mailto:thestickersmith@gmail.com" style="color:#167397;text-decoration:underline">Contact the shop</a><br>Payment service provided by Intuit Payments Inc.</td></tr>
</table></td></tr></table></body></html>`
}
