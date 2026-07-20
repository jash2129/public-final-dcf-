import { Router, Request, Response } from 'express';
import nodemailer from 'nodemailer';
import { createLead } from '../models/lead.model';
import { sendMarketingEmail } from '../services/notification.service';
import { formatPhoneWithCountryCode } from '../utils/helpers';

const router = Router();

// POST /api/contact
router.post('/', async (req: Request, res: Response) => {
  const { name, mobile, email, category, service, address } = req.body;

  if (!name || !mobile || !email || !category || !address) {
    return res.status(400).json({ error: 'Please fill in all required fields.' });
  }

  try {
    const formattedMobile = formatPhoneWithCountryCode(mobile) || mobile;
    const serviceName = service || category || 'General Inquiry';

    // 1. Save lead to database for drip sequence tracking
    try {
      await createLead({
        full_name: name,
        mobile_number: formattedMobile,
        email_address: email,
        city: address,
        service_name: serviceName
      });
      console.log(`Lead saved to database from Contact Form: ${email}`);
    } catch (dbErr: any) {
      console.error('Failed to save lead to database:', dbErr);
    }

    // 2. Trigger Day 0 Marketing Sequence to the Lead
    try {
      await sendMarketingEmail(name, email, formattedMobile, serviceName, 0);
      console.log(`Day 0 marketing sequence triggered for: ${email}`);
    } catch (emailErr: any) {
      console.error('Failed to send Day 0 marketing sequence:', emailErr);
    }

    // 3. Configure transporter for internal HR notification
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
      // Local dev: log to console and return success
      console.log('=== CONTACT FORM SUBMISSION (no SMTP configured) ===');
      console.log({ name, mobile, email, category, service, address });
      console.log('Would send to: hr@deccanfilings.com');
      console.log('====================================================');
      return res.json({ success: true, message: 'Message received! (SMTP not configured — logged to console)' });
    }

    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #f9fafb; border-radius: 12px;">
        <h2 style="color: #1e293b; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; margin-top: 0;">
          New Contact Form Submission — Deccan Filings
        </h2>
        <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
          <tr style="background: #fff; border-radius: 8px;">
            <td style="padding: 10px 16px; font-weight: bold; color: #64748b; width: 160px;">Name</td>
            <td style="padding: 10px 16px; color: #1e293b;">${name}</td>
          </tr>
          <tr style="background: #f8fafc;">
            <td style="padding: 10px 16px; font-weight: bold; color: #64748b;">Mobile</td>
            <td style="padding: 10px 16px; color: #1e293b;">${mobile}</td>
          </tr>
          <tr style="background: #fff;">
            <td style="padding: 10px 16px; font-weight: bold; color: #64748b;">Email</td>
            <td style="padding: 10px 16px; color: #1e293b;">${email}</td>
          </tr>
          <tr style="background: #f8fafc;">
            <td style="padding: 10px 16px; font-weight: bold; color: #64748b;">Category</td>
            <td style="padding: 10px 16px; color: #1e293b;">${category}</td>
          </tr>
          <tr style="background: #fff;">
            <td style="padding: 10px 16px; font-weight: bold; color: #64748b;">Service</td>
            <td style="padding: 10px 16px; color: #1e293b;">${service || 'Not specified'}</td>
          </tr>
          <tr style="background: #f8fafc;">
            <td style="padding: 10px 16px; font-weight: bold; color: #64748b;">Address</td>
            <td style="padding: 10px 16px; color: #1e293b;">${address}</td>
          </tr>
        </table>
        <p style="margin-top: 24px; font-size: 12px; color: #94a3b8; text-align: center;">
          Sent from the Deccan Filings website contact form · ${new Date().toLocaleString('en-IN')}
        </p>
      </div>
    `;

    const fromEmail = process.env.SYSTEM_EMAIL_FROM || process.env.SMTP_USER || 'support@deccanfilings.com';
    const toEmail = process.env.TEAM_EMAIL || 'deccanfilings@gmail.com';

    await transporter.sendMail({
      from: `"Deccan Filings Website" <${fromEmail}>`,
      to: toEmail,
      replyTo: email,
      subject: `New Enquiry: ${category}${service ? ' – ' + service : ''} from ${name}`,
      html: htmlBody,
    });

    return res.json({ success: true, message: 'Your message has been sent! We will get back to you shortly.' });
  } catch (err: any) {
    console.error('Contact form email error:', err);
    return res.status(500).json({ error: 'Failed to send message. Please try again.' });
  }
});

export default router;
