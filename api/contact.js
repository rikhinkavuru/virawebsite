import { Resend } from 'resend';

// Re-using the same hardened logic but in a serverless-friendly handler format
// This works perfectly on Vercel, Netlify, and local vercel-dev environments
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, school, request } = req.body;

  if (!name || !school || !request) {
    return res.status(400).json({ error: 'Missing required transmission packets' });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    const { data, error } = await resend.emails.send({
      from: 'Vira Hacks <contact@virahacks.com>',
      to: ['rikhinkavuru@gmail.com'],
      subject: `[Vira] Contact Request: ${name}`,
      html: `
        <div style="font-family: sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px;">
          <h2 style="color: #7c3aed; margin-top: 0;">New Contact Request</h2>
          <hr style="border: 0; border-top: 1px solid #eee;" />
          <p><strong>From:</strong> ${name}</p>
          <p><strong>School:</strong> ${school}</p>
          <p style="margin-bottom: 5px;"><strong>Request Details:</strong></p>
          <div style="background: #f9f9f9; padding: 15px; border-left: 4px solid #7c3aed; font-style: italic;">
            ${request.replace(/\n/g, '<br/>')}
          </div>
          <p style="font-size: 0.8rem; color: #999; margin-top: 20px;">
            This was sent from the vira architecture portal.
          </p>
        </div>
      `,
    });

    if (error) {
      console.error('Resend Error:', error);
      return res.status(400).json({ error });
    }

    return res.status(200).json({ success: true, data });
  } catch (err) {
    console.error('Server Internal Error:', err);
    return res.status(500).json({ error: 'Internal System Timeout during packet routing.' });
  }
}
