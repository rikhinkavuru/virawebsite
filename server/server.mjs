import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Resend } from 'resend';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;
const resend = new Resend(process.env.RESEND_API_KEY);

app.use(cors());
app.use(express.json());

app.post('/api/contact', async (req, res) => {
  const { name, school, request } = req.body;

  if (!name || !school || !request) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Following official Node.js SDK instructions for Resend
    const { data, error } = await resend.emails.send({
      from: 'Vira Hacks <contact@virahacks.com>',
      to: ['rikhinkavuru@gmail.com'],
      subject: `[Vira] Contact Request: ${name}`,
      html: `
        <div style="font-family: sans-serif; line-height: 1.6; color: #333;">
          <h2 style="color: #7c3aed;">New Contact Request</h2>
          <hr style="border: 0; border-top: 1px solid #eee;" />
          <p><strong>From:</strong> ${name}</p>
          <p><strong>School:</strong> ${school}</p>
          <p><strong>Request Details:</strong></p>
          <blockquote style="background: #f9f9f9; padding: 15px; border-left: 5px solid #7c3aed; margin: 0;">
            ${request}
          </blockquote>
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
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(port, () => {
  console.log(`Email server running on http://localhost:${port}`);
  console.log('Secure CORS enabled for client requests.');
});
