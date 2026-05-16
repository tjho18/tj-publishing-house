import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getResend, FROM_EMAIL, buildAnnouncementEmail } from '@/lib/resend'

export async function POST(req: NextRequest) {
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not set — skipping announcement email')
    return NextResponse.json({ ok: true, skipped: true })
  }

  const { workId } = await req.json()
  if (!workId) return NextResponse.json({ error: 'Missing workId' }, { status: 400 })

  const supabase = await createClient()

  // Verify requester is authenticated admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Fetch work
  const { data: work } = await supabase
    .from('works')
    .select('title, type, description, slug')
    .eq('id', workId)
    .single()

  if (!work) return NextResponse.json({ error: 'Work not found' }, { status: 404 })

  // Fetch all subscriber emails
  const { data: subscribers } = await supabase
    .from('subscribers')
    .select('email')

  if (!subscribers || subscribers.length === 0) {
    return NextResponse.json({ ok: true, sent: 0 })
  }

  const { subject, html } = buildAnnouncementEmail(work)

  // Send in batches of 50 (Resend limit per call)
  const emails = subscribers.map(s => s.email)
  const batches: string[][] = []
  for (let i = 0; i < emails.length; i += 50) {
    batches.push(emails.slice(i, i + 50))
  }

  let sent = 0
  for (const batch of batches) {
    const { error } = await getResend().emails.send({
      from: FROM_EMAIL,
      to: batch,
      subject,
      html,
    })
    if (!error) sent += batch.length
  }

  return NextResponse.json({ ok: true, sent })
}
