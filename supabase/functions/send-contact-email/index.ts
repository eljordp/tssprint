import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const FROM_EMAIL = 'The Sticker Smith <noreply@thestickersmith.com>'
const OWNER_EMAIL = 'thestickersmith@gmail.com'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { name, email, phone, service, message } = await req.json()

    if (!name || !email || !message) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Send notification to business owner
    const ownerRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [OWNER_EMAIL],
        subject: `New Quote Request from ${name}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">New Quote Request</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px 0; color: #666; width: 100px;">Name:</td><td style="padding: 8px 0; font-weight: bold;">${name}</td></tr>
              <tr><td style="padding: 8px 0; color: #666;">Email:</td><td style="padding: 8px 0;"><a href="mailto:${email}">${email}</a></td></tr>
              ${phone ? `<tr><td style="padding: 8px 0; color: #666;">Phone:</td><td style="padding: 8px 0;"><a href="tel:${phone}">${phone}</a></td></tr>` : ''}
              ${service ? `<tr><td style="padding: 8px 0; color: #666;">Service:</td><td style="padding: 8px 0;">${service}</td></tr>` : ''}
            </table>
            <div style="margin-top: 16px; padding: 16px; background: #f5f5f5; border-radius: 8px;">
              <p style="color: #666; margin: 0 0 8px 0; font-size: 14px;">Message:</p>
              <p style="margin: 0; white-space: pre-wrap;">${message}</p>
            </div>
          </div>
        `,
      }),
    })

    if (!ownerRes.ok) {
      const err = await ownerRes.text()
      throw new Error(`Resend error: ${err}`)
    }

    // Send confirmation to customer
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [email],
        subject: 'We received your quote request!',
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Thanks for reaching out, ${name}!</h2>
            <p>We've received your quote request and will get back to you within 24 hours.</p>
            <p style="color: #666;">Here's what you sent us:</p>
            <div style="padding: 16px; background: #f5f5f5; border-radius: 8px; margin: 16px 0;">
              <p style="margin: 0; white-space: pre-wrap;">${message}</p>
            </div>
            <p style="color: #666; font-size: 14px;">— The Sticker Smith Team</p>
          </div>
        `,
      }),
    })

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
