const nodemailer = require('nodemailer');

module.exports = async function handler(req, res) {
  // Allow only POST
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, code: 'METHOD_NOT_ALLOWED' });
    return;
  }

  try {
    const {
      name = '',
      email = '',
      phone = '',
      destination = '',
      travelers = '',
      travelDate = '',
      message = '',
      submittedAt = ''
    } = req.body || {};

    // Basic validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
    if (!emailPattern.test(email)) {
      return res.status(400).json({ ok: false, code: 'INVALID_EMAIL' });
    }

    const SMTP_HOST = process.env.SMTP_HOST;
    const SMTP_PORT = Number(process.env.SMTP_PORT || 465);
    const SMTP_USER = process.env.SMTP_USER;
    const SMTP_PASS = process.env.SMTP_PASS;
    const OWNER_EMAIL = process.env.OWNER_EMAIL;
    const BRAND = process.env.BRAND_NAME || 'Easygo Travels';

    if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS || !OWNER_EMAIL) {
      return res.status(500).json({ ok: false, code: 'SMTP_NOT_CONFIGURED' });
    }

    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465, // true for 465, false for 587
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });

    // Owner email
    const ownerHtml = `
      <h2>New Booking Request</h2>
      <p><strong>Name:</strong> ${name || '—'}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone || '—'}</p>
      <p><strong>Destination:</strong> ${destination || '—'}</p>
      <p><strong>Travelers:</strong> ${travelers || '—'}</p>
      <p><strong>Travel Date:</strong> ${travelDate || '—'}</p>
      <p><strong>Message:</strong> ${message || '—'}</p>
      <p><small>Submitted at: ${submittedAt || new Date().toISOString()}</small></p>
    `;

    const ownerMail = {
      from: { name: BRAND, address: SMTP_USER },
      to: OWNER_EMAIL,
      subject: `New booking from ${name || 'Traveler'}`,
      text: `New booking from ${name || 'Traveler'}\nEmail: ${email}\nPhone: ${phone}\nDestination: ${destination}\nTravelers: ${travelers}\nTravel Date: ${travelDate}\nMessage: ${message}`,
      html: ownerHtml,
    };

    // User confirmation
    const userHtml = `
      <div>
        <h2>Thanks for your request, ${name || 'Traveler'}!</h2>
        <p>We received your inquiry at <strong>${BRAND}</strong>. Our team will contact you within 24 hours.</p>
        <h3>Summary</h3>
        <ul>
          <li><strong>Destination:</strong> ${destination || '—'}</li>
          <li><strong>Travelers:</strong> ${travelers || '—'}</li>
          <li><strong>Travel Date:</strong> ${travelDate || '—'}</li>
        </ul>
        <p>If anything is incorrect, reply to this email and we’ll update it.</p>
      </div>
    `;

    const userMail = {
      from: { name: BRAND, address: SMTP_USER },
      to: email,
      subject: `We received your request — ${BRAND}`,
      text: `Thanks for your request, ${name || 'Traveler'}. We received your inquiry. Destination: ${destination}. Travelers: ${travelers}. Date: ${travelDate}.`,
      html: userHtml,
    };

    await Promise.all([
      transporter.sendMail(ownerMail),
      transporter.sendMail(userMail),
    ]);

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error('contact api error', err);
    res.status(500).json({ ok: false, code: 'SEND_FAILED' });
  }
};
