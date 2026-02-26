/**
 * Cloudflare Pages Function — Contact Form Handler
 * POST /api/contact
 *
 * Receives form data, validates, and sends email via MailChannels.
 * MailChannels is free for Cloudflare Workers — no API key needed.
 *
 * Setup: Add a DNS TXT record for MailChannels SPF:
 *   _mailchannels.wvdberg.com TXT "v=mc1 cfid=wvdberg.pages.dev"
 */

export async function onRequestPost(context) {
  const { request } = context;

  // Basic rate limiting via CF headers
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';

  // Parse body
  let body;
  try {
    body = await request.json();
  } catch {
    return jsonResponse(400, { message: 'Ongeldig verzoek.' });
  }

  // Validate required fields
  const { naam, telefoon, email, bericht } = body;

  if (!naam || typeof naam !== 'string' || naam.trim().length < 2) {
    return jsonResponse(400, { message: 'Vul uw naam in.' });
  }

  if (!telefoon || typeof telefoon !== 'string' || telefoon.trim().length < 6) {
    return jsonResponse(400, { message: 'Vul een geldig telefoonnummer in.' });
  }

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return jsonResponse(400, { message: 'Vul een geldig e-mailadres in.' });
  }

  if (!bericht || typeof bericht !== 'string' || bericht.trim().length < 5) {
    return jsonResponse(400, { message: 'Beschrijf kort uw klus.' });
  }

  // Honeypot check — if a hidden field is filled, it's a bot
  if (body.website) {
    return jsonResponse(200, { message: 'Bedankt!' });
  }

  // Build email content
  const emailBody = [
    `Nieuwe offerte-aanvraag via wvdberg.com`,
    ``,
    `Naam: ${naam.trim()}`,
    `Telefoon: ${telefoon.trim()}`,
    email ? `E-mail: ${email.trim()}` : `E-mail: (niet ingevuld)`,
    ``,
    `Beschrijving:`,
    bericht.trim(),
    ``,
    `---`,
    `Verzonden vanaf: wvdberg.com`,
    `IP: ${ip}`,
    `Tijd: ${new Date().toISOString()}`
  ].join('\n');

  // Send via MailChannels
  try {
    const mailResponse = await fetch('https://api.mailchannels.net/tx/v1/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        personalizations: [
          {
            to: [{ email: 'info@wvdberg.com', name: 'Wim van den Berg' }]
          }
        ],
        from: {
          email: 'noreply@wvdberg.com',
          name: 'Website wvdberg.com'
        },
        reply_to: email
          ? { email: email.trim(), name: naam.trim() }
          : undefined,
        subject: `Offerte-aanvraag van ${naam.trim()}`,
        content: [
          {
            type: 'text/plain',
            value: emailBody
          }
        ]
      })
    });

    if (mailResponse.status === 202 || mailResponse.status === 200) {
      return jsonResponse(200, { message: 'Bedankt! Uw aanvraag is verzonden.' });
    }

    console.error('MailChannels error:', mailResponse.status, await mailResponse.text());
    return jsonResponse(500, { message: 'E-mail verzenden mislukt. Bel gerust direct.' });
  } catch (err) {
    console.error('Mail send error:', err);
    return jsonResponse(500, { message: 'Er is iets misgegaan. Bel gerust direct.' });
  }
}

// Reject non-POST requests
export async function onRequestGet() {
  return jsonResponse(405, { message: 'Methode niet toegestaan.' });
}

function jsonResponse(status, data) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': 'https://wvdberg.com'
    }
  });
}
