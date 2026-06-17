import { Router, Request, Response } from 'express';
import nodemailer from 'nodemailer';

const router = Router();

// POST /api/leads/callback
router.post('/callback', async (req: Request, res: Response) => {
  const { fullName, mobileNumber, emailAddress, city, serviceName } = req.body;

  if (!fullName || !mobileNumber || !emailAddress || !city || !serviceName) {
    return res.status(400).json({ error: 'Please fill in all required fields.' });
  }

  try {
    let transporter: nodemailer.Transporter;

    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587', 10),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    } else {
      console.log('=== CALLBACK REQUEST SUBMISSION (no SMTP configured) ===');
      console.log({ fullName, mobileNumber, emailAddress, city, serviceName });
      console.log('Would send to: deccanfilings@gmail.com');
      console.log('========================================================');
      return res.json({ success: true, message: 'Callback request received! (SMTP not configured — logged to console)' });
    }

    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #f9fafb; border-radius: 12px; border: 1px solid #e2e8f0;">
        <h2 style="color: #b91c1c; border-bottom: 2px solid #fee2e2; padding-bottom: 12px; margin-top: 0; font-size: 20px;">
          🚨 New Callback Request
        </h2>
        <p style="color: #475569; font-size: 14px; margin-bottom: 20px;">
          A visitor has requested a callback for <strong>${serviceName}</strong>. Details are below:
        </p>
        <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
          <tr style="background: #ffffff; border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 12px 16px; font-weight: bold; color: #64748b; width: 160px; font-size: 14px;">Full Name</td>
            <td style="padding: 12px 16px; color: #0f172a; font-size: 14px;">${fullName}</td>
          </tr>
          <tr style="background: #f8fafc; border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 12px 16px; font-weight: bold; color: #64748b; font-size: 14px;">Mobile Number</td>
            <td style="padding: 12px 16px; color: #0f172a; font-size: 14px;">${mobileNumber}</td>
          </tr>
          <tr style="background: #ffffff; border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 12px 16px; font-weight: bold; color: #64748b; font-size: 14px;">Email Address</td>
            <td style="padding: 12px 16px; color: #0f172a; font-size: 14px;"><a href="mailto:${emailAddress}" style="color: #2563eb; text-decoration: none;">${emailAddress}</a></td>
          </tr>
          <tr style="background: #f8fafc; border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 12px 16px; font-weight: bold; color: #64748b; font-size: 14px;">City</td>
            <td style="padding: 12px 16px; color: #0f172a; font-size: 14px;">${city}</td>
          </tr>
          <tr style="background: #ffffff; border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 12px 16px; font-weight: bold; color: #64748b; font-size: 14px;">Requested Service</td>
            <td style="padding: 12px 16px; color: #0f172a; font-size: 14px; font-weight: 600;">${serviceName}</td>
          </tr>
        </table>
        <p style="margin-top: 24px; font-size: 12px; color: #94a3b8; text-align: center;">
          Sent from Deccan Filings Website · ${new Date().toLocaleString('en-IN')}
        </p>
      </div>
    `;

    const fromEmail = process.env.SYSTEM_EMAIL_FROM || process.env.SMTP_USER || 'support@deccanfilings.com';

    await transporter.sendMail({
      from: `"Deccan Filings Lead" <${fromEmail}>`,
      to: process.env.TEAM_EMAIL || 'deccanfilings@gmail.com',
      replyTo: emailAddress,
      subject: `🚨 New Callback Request: ${serviceName}`,
      html: htmlBody,
    });

    return res.status(200).json({ success: true, message: 'Callback request received and email sent successfully.' });
  } catch (err: any) {
    console.error('Callback lead email error:', err);
    return res.status(500).json({ error: 'Failed to submit callback request. Please try again.' });
  }
});

export default router;
