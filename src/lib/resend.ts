import { Resend } from 'resend'

export function getResend() {
  return new Resend(process.env.RESEND_API_KEY ?? 'placeholder')
}

export const FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL ?? 'TJ Publishing House <onboarding@resend.dev>'

export function buildAnnouncementEmail(work: {
  title: string
  type: string
  description: string | null
  slug: string
}) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://tj-publishing-house.vercel.app'
  const typeLabel: Record<string, string> = {
    novel: 'a new novel',
    story: 'a new short story',
    essay: 'a new essay',
  }
  const readUrl = `${siteUrl}/read/${work.slug}`

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
</head>
<body style="margin:0;padding:0;background:#F7F4EF;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F7F4EF;padding:40px 20px;">
    <tr><td align="center">
      <table width="100%" style="max-width:560px;background:#FAFAF7;border:1px solid #E4DFD8;border-radius:12px;overflow:hidden;">
        <tr>
          <td style="padding:40px 40px 32px;border-bottom:1px solid #E4DFD8;">
            <p style="margin:0 0 8px;font-family:'Inter',sans-serif;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#9B938A;">
              TJ Publishing House
            </p>
            <h1 style="margin:0;font-size:28px;font-weight:400;color:#28231E;line-height:1.2;">
              ${work.title}
            </h1>
          </td>
        </tr>
        <tr>
          <td style="padding:32px 40px;">
            <p style="margin:0 0 20px;font-size:15px;color:#6B635A;line-height:1.7;">
              TJ just published ${typeLabel[work.type] ?? 'new work'}.
              ${work.description ? `<br><br>${work.description}` : ''}
            </p>
            <a href="${readUrl}"
               style="display:inline-block;padding:12px 28px;background:#28231E;color:#F7F4EF;text-decoration:none;border-radius:100px;font-family:'Inter',sans-serif;font-size:13px;font-weight:500;">
              Read now →
            </a>
          </td>
        </tr>
        <tr>
          <td style="padding:20px 40px;border-top:1px solid #E4DFD8;">
            <p style="margin:0;font-family:'Inter',sans-serif;font-size:11px;color:#9B938A;">
              You're receiving this because you subscribed at TJ Publishing House.
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`

  return {
    subject: `New from TJ: ${work.title}`,
    html,
  }
}
