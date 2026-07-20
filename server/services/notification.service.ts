import fs from 'fs';
import path from 'path';
import { pool } from '../db';
import { formatCurrency } from '../utils/helpers';
import nodemailer from 'nodemailer';
import * as invoiceService from './invoice.service';
import mysql from 'mysql2/promise';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || '',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
});

const LOG_DIR = path.join(process.cwd(), 'logs');
const LOG_FILE = path.join(LOG_DIR, 'notifications.log');

/**
 * Ensures the logs directory and notifications.log file exist
 */
function ensureLogFile() {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }
  if (!fs.existsSync(LOG_FILE)) {
    fs.writeFileSync(LOG_FILE, '', 'utf-8');
  }
}

/**
 * Log notification dispatch to a local log file for testing and auditing
 */
function logNotificationToFile(type: 'EMAIL' | 'SMS' | 'WHATSAPP_TEMPLATE' | 'WHATSAPP', recipient: string, subjectOrMessage: string, body?: string) {
  ensureLogFile();
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] [${type}] To: ${recipient}\n` + 
                   (body ? `Subject: ${subjectOrMessage}\nBody: ${body}` : `Message: ${subjectOrMessage}`) + 
                   `\n------------------------------------------------------------\n`;
  fs.appendFileSync(LOG_FILE, logEntry, 'utf-8');
}

/**
 * Log to DB activity_log table for Admin visibility
 */
async function logToActivityDB(userId: number, action: string, details: string) {
  try {
    const [rows] = await pool.query<any[]>('SELECT name, email FROM users WHERE id = ?', [userId]);
    const name = rows.length > 0 ? rows[0].name : 'System';
    const email = rows.length > 0 ? rows[0].email : '';
    await pool.execute(
      'INSERT INTO activity_log (user_id, action, details, user_name, user_email) VALUES (?, ?, ?, ?, ?)',
      [userId, action, details, name, email]
    );
  } catch (error) {
    console.error("Failed to write notification audit to activity_log:", error);
  }
}

/**
 * Mock Email Dispatcher
 */
export async function sendEmail(
  to: string,
  subject: string,
  body: string,
  userId?: number,
  attachments?: any[],
  html?: string
): Promise<boolean> {
  const smtpHost = process.env.SMTP_HOST;
  
  if (smtpHost) {
    try {
      const fromEmail = process.env.SYSTEM_EMAIL_FROM || process.env.SMTP_USER || 'support@deccanfilings.com';
      await transporter.sendMail({
        from: fromEmail,
        to,
        subject,
        text: body,
        html,
        attachments,
      });
      console.log(`[SMTP] Email sent successfully to ${to}`);
      if (userId) {
        await logToActivityDB(userId, 'Email Dispatched', `Subject: ${subject}`);
      }
      return true;
    } catch (error) {
      console.error(`[SMTP ERROR] Failed to send email to ${to}, falling back to mock logging. Error:`, error);
    }
  }

  // Graceful fallback to mock logging
  console.log(`[SMTP MOCK] Sending Email to ${to}:\nSubject: ${subject}\nBody: ${body}\n${html ? `HTML: ${html.substring(0, 100)}...\n` : ''}`);
  logNotificationToFile('EMAIL', to, subject, html ? `TEXT:\n${body}\n\nHTML:\n${html}` : body);
  if (userId) {
    await logToActivityDB(userId, 'Email Dispatched (Mock)', `Subject: ${subject}`);
  }
  return true;
}

/**
 * Mock SMS Dispatcher
 */
export async function sendSMS(toPhone: string, message: string, userId?: number): Promise<boolean> {
  console.log(`[SMS GATEWAY MOCK] Sending SMS to ${toPhone}:\nMessage: ${message}\n`);
  logNotificationToFile('SMS', toPhone, message);
  if (userId) {
    await logToActivityDB(userId, 'SMS Dispatched', `Message: ${message}`);
  }
  return true;
}

/**
 * Meta Cloud API WhatsApp Dispatcher
 */
export async function sendWhatsAppTemplate(
  toPhone: string,
  templateName: string,
  params: string[],
  userId?: number
): Promise<boolean> {
  const phoneId = process.env.WHATSAPP_PHONE_ID;
  const token = process.env.WHATSAPP_ACCESS_TOKEN;

  if (!phoneId || !token) {
    console.log(`[WHATSAPP MOCK] Missing credentials. Would send template '${templateName}' to ${toPhone} with params:`, params);
    logNotificationToFile('WHATSAPP_TEMPLATE', toPhone, templateName, JSON.stringify(params));
    return true;
  }

  // Format parameters for Meta API
  const components = params.length > 0 ? [
    {
      type: 'body',
      parameters: params.map(p => ({ type: 'text', text: p }))
    }
  ] : [];

  try {
    // Remove '+' and spaces from phone number as Meta expects format without leading +
    const cleanPhone = toPhone.replace(/\D/g, '');
    
    const response = await fetch(`https://graph.facebook.com/v17.0/${phoneId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: cleanPhone,
        type: 'template',
        template: {
          name: templateName,
          language: { code: 'en' }, // Adjust if you use a different default language
          components
        }
      })
    });

    const result = await response.json();
    if (!response.ok) {
      console.error(`[WHATSAPP ERROR] Failed to send template ${templateName} to ${toPhone}:`, result);
      return false;
    }
    
    console.log(`[WHATSAPP] Sent template ${templateName} to ${toPhone}`);
    if (userId) {
      await logToActivityDB(userId, 'WhatsApp Template Dispatched', `Template: ${templateName}`);
    }
    return true;
  } catch (error) {
    console.error(`[WHATSAPP ERROR] Exception while sending template ${templateName} to ${toPhone}:`, error);
    return false;
  }
}

/**
 * Notify user of new order placement
 */
export async function notifyOrderPlacement(
  orderId: string,
  userEmail: string,
  userPhone: string,
  userName: string,
  serviceNames: string,
  amount: number,
  userId: number
): Promise<void> {
  const basePrice = amount / 1.18;
  const cgst = basePrice * 0.09;
  const sgst = basePrice * 0.09;

  const formattedBase = `₹${basePrice.toFixed(2)}`;
  const formattedCgst = `₹${cgst.toFixed(2)}`;
  const formattedSgst = `₹${sgst.toFixed(2)}`;
  const formattedTotal = `₹${amount.toFixed(2)}`;

  // Email
  const emailSubject = `Order Placed Successfully - ${orderId}`;
  const emailBody = `Hi ${userName},\n\n` +
                    `Thank you for choosing Deccan Filings! We have received your order.\n\n` +
                    `Order Details:\n` +
                    `- Order ID: ${orderId}\n` +
                    `- Services: ${serviceNames}\n` +
                    `- Base Price: ${formattedBase}\n` +
                    `- CGST (9%): ${formattedCgst}\n` +
                    `- SGST (9%): ${formattedSgst}\n` +
                    `- Total Amount: ${formattedTotal}\n` +
                    `- Status: Placed (Our experts will start working shortly)\n\n` +
                    `Best regards,\nTeam Deccan Filings`;
  await sendEmail(userEmail, emailSubject, emailBody, userId);

  // SMS & WhatsApp
  const smsMessage = `Hi ${userName}, order ${orderId} for ${serviceNames} (Amt: ${formattedTotal}) has been placed successfully. Team Deccan Filings`;
  if (userPhone) {
    await sendSMS(userPhone, smsMessage, userId);
    await sendWhatsAppTemplate(userPhone, 'utility_order_placed', [userName, orderId, serviceNames, formattedTotal], userId);
  }
}

/**
 * Notify user of order status change
 */
export async function notifyOrderStatusChange(
  orderId: string,
  status: string,
  userEmail: string,
  userPhone: string,
  userName: string,
  userId: number
): Promise<void> {
  const statusDisplay = status.toUpperCase().replace('_', ' ');

  // Email
  const emailSubject = `Order Update - ${orderId}`;
  const emailBody = `Hi ${userName},\n\n` +
                    `Your order ${orderId} has been updated to: ${statusDisplay}.\n\n` +
                    `You can track the progress and upload any required documents via your customer dashboard.\n\n` +
                    `Best regards,\nTeam Deccan Filings`;
  await sendEmail(userEmail, emailSubject, emailBody, userId);

  // SMS & WhatsApp
  const smsMessage = `Hi ${userName}, status of your order ${orderId} has been updated to ${statusDisplay}. Log in to dashboard to check. Team Deccan Filings`;
  if (userPhone) {
    await sendSMS(userPhone, smsMessage, userId);
    await sendWhatsAppTemplate(userPhone, 'utility_order_status', [userName, orderId, statusDisplay], userId);
  }
}

/**
 * Notify user of upcoming or overdue compliance task
 */
export async function notifyComplianceDeadline(
  taskTitle: string,
  dueDate: string,
  userEmail: string,
  userPhone: string,
  userName: string,
  status: 'upcoming' | 'overdue',
  daysRemaining: number,
  userId: number
): Promise<void> {
  // Email
  const subject = status === 'overdue' 
    ? `URGENT: Compliance Overdue - ${taskTitle}` 
    : `Reminder: Compliance Due in ${daysRemaining} Days - ${taskTitle}`;

  const emailBody = `Hi ${userName},\n\n` +
                    (status === 'overdue'
                      ? `This is a reminder that the compliance filing for "${taskTitle}" was due on ${dueDate} and is now OVERDUE. Please submit the required documents immediately to avoid statutory penalties.`
                      : `This is a reminder that the compliance filing for "${taskTitle}" is due on ${dueDate} (${daysRemaining} days remaining). Please share the necessary documents so we can file on time.`) +
                    `\n\nBest regards,\nTeam Deccan Filings`;
  await sendEmail(userEmail, subject, emailBody, userId);

  // SMS & WhatsApp
  const smsMessage = status === 'overdue'
    ? `Hi ${userName}, compliance for ${taskTitle} was due on ${dueDate} and is OVERDUE. Please share documents immediately to avoid penalties. Team Deccan Filings`
    : `Hi ${userName}, compliance for ${taskTitle} is due on ${dueDate}. Please share required documents at the earliest. Team Deccan Filings`;

  if (userPhone) {
    await sendSMS(userPhone, smsMessage, userId);
    if (status === 'overdue') {
      await sendWhatsAppTemplate(userPhone, 'utility_compliance_overdue', [userName, taskTitle, dueDate], userId);
    } else {
      await sendWhatsAppTemplate(userPhone, 'utility_compliance_upcoming', [userName, taskTitle, dueDate, daysRemaining.toString()], userId);
    }
  }
}

/**
 * Notify user of payment success
 */
export async function notifyPaymentSuccess(
  orderId: string,
  amount: number,
  userEmail: string,
  userName: string,
  userId: number,
  serviceName: string
): Promise<void> {
  const basePrice = amount / 1.18;
  const cgst = basePrice * 0.09;
  const sgst = basePrice * 0.09;

  const formattedBase = `₹${basePrice.toFixed(2)}`;
  const formattedCgst = `₹${cgst.toFixed(2)}`;
  const formattedSgst = `₹${sgst.toFixed(2)}`;
  const formattedTotal = `₹${amount.toFixed(2)}`;

  const emailSubject = `Payment Received - Invoice for Order ${orderId}`;
  const emailBody = `Hi ${userName},\n\n` +
                    `We are pleased to confirm that your payment of ${formattedTotal} for Order ${orderId} has been successfully received.\n\n` +
                    `Payment Summary:\n` +
                    `- Base Price: ${formattedBase}\n` +
                    `- CGST (9%): ${formattedCgst}\n` +
                    `- SGST (9%): ${formattedSgst}\n` +
                    `- Total Paid: ${formattedTotal}\n\n` +
                    `Thank you for choosing Deccan Filings! Our professional team has already begun processing your filing request. We will reach out to you if any additional documents or clarifications are needed.\n\n` +
                    `You can monitor the status of your request at any time by logging into your dashboard.\n\n` +
                    `Best regards,\nTeam Deccan Filings`;
  
  let attachments: any[] | undefined = undefined;
  try {
    const pdfBuffer = await invoiceService.generateInvoiceBuffer(
      orderId,
      amount,
      userName,
      userEmail,
      serviceName
    );
    attachments = [
      {
        filename: `Invoice_${orderId}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf',
      },
    ];
  } catch (err) {
    console.error(`Failed to generate invoice PDF for order ${orderId}:`, err);
  }

  await sendEmail(userEmail, emailSubject, emailBody, userId, attachments);

  // Send SMS & WhatsApp if we can retrieve phone number
  try {
    const [userRows] = await pool.query<mysql.RowDataPacket[]>('SELECT phone FROM users WHERE id = ?', [userId]);
    if (userRows.length > 0 && userRows[0].phone) {
      const phone = userRows[0].phone;
      const smsMessage = `Hi ${userName}, we have received your payment of ${formattedTotal} for Order ${orderId}. Team Deccan Filings`;
      await sendSMS(phone, smsMessage, userId);
      await sendWhatsAppTemplate(phone, 'utility_payment_success', [userName, formattedTotal, orderId], userId);
    }
  } catch (err) {
    console.error(`Failed to dispatch payment success SMS/WhatsApp for order ${orderId}:`, err);
  }
}

/**
 * Send welcome email and SMS to a newly registered user
 */
export async function notifyWelcome(
  email: string,
  name: string,
  userId: number,
  phone?: string | null
): Promise<void> {
  const subject = `Welcome to Deccan Filings, ${name}!`;
  
  const textBody = `Hi ${name},\n\n` +
                   `Welcome to Deccan Filings! We're excited to help you launch and grow your business.\n\n` +
                   `Here is what you can do next:\n` +
                   `1. Explore our services: Private Limited registration, GST filings, Trademark filing, and more.\n` +
                   `2. Access your Customer Dashboard to place orders, upload documents, and track compliance status.\n` +
                   `3. Schedule a free consultation with our CA/CS experts.\n\n` +
                   `If you have any questions, feel free to reply to this email or call our team at +91 90009 30453 / +91 90002 43270.\n\n` +
                   `Best regards,\nTeam Deccan Filings`;

  const htmlBody = `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 24px; background-color: #f8fafc; border-radius: 24px; border: 1px solid #e2e8f0; color: #0f172a;">
      <div style="text-align: center; margin-bottom: 32px;">
        <h1 style="color: #0f172a; font-size: 28px; font-weight: 800; margin: 0; tracking-tight">Deccan Filings</h1>
        <p style="color: #64748b; font-size: 14px; margin-top: 4px;">India's Trusted Compliance Platform</p>
      </div>
      
      <div style="background-color: #ffffff; padding: 32px; border-radius: 16px; border: 1px solid #f1f5f9; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
        <h2 style="color: #0f172a; font-size: 20px; font-weight: 700; margin-top: 0; margin-bottom: 16px;">Hello ${name},</h2>
        <p style="color: #334155; font-size: 15px; line-height: 1.6; margin-bottom: 24px;">
          Welcome to Deccan Filings! We are thrilled to have you join our platform. Whether you are incorporating a new startup, registering a trademark, or keeping up with corporate tax filings, our team of CA/CS experts is here to make compliance simple, fast, and affordable.
        </p>

        <h3 style="color: #0f172a; font-size: 15px; font-weight: 700; margin-bottom: 12px; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px;">What's Next?</h3>
        
        <div style="margin-bottom: 16px;">
          <strong style="color: #0f172a; font-size: 14px;">🚀 Start Your Business</strong>
          <p style="color: #475569; font-size: 13px; margin: 4px 0 0 0; line-height: 1.5;">Incorporate a Private Limited, LLP, or OPC with hassle-free professional support.</p>
        </div>

        <div style="margin-bottom: 16px;">
          <strong style="color: #0f172a; font-size: 14px;">📋 Track Compliance & Orders</strong>
          <p style="color: #475569; font-size: 13px; margin: 4px 0 0 0; line-height: 1.5;">Log into your dashboard to upload documents, view invoice records, and check status in real-time.</p>
        </div>

        <div style="margin-bottom: 24px;">
          <strong style="color: #0f172a; font-size: 14px;">📞 Talk to an Expert</strong>
          <p style="color: #475569; font-size: 13px; margin: 4px 0 0 0; line-height: 1.5;">Schedule a dedicated compliance session with our specialists to streamline your regulatory workflow.</p>
        </div>

        <div style="text-align: center; margin: 32px 0 16px 0;">
          <a href="https://www.deccanfilings.com/login" style="background-color: #fca311; color: #000000; padding: 14px 32px; text-decoration: none; border-radius: 12px; font-weight: 800; font-size: 15px; display: inline-block; box-shadow: 0 4px 12px rgba(252, 163, 17, 0.25);">Go to Dashboard</a>
        </div>
      </div>

      <div style="text-align: center; margin-top: 32px; padding: 0 16px;">
        <p style="color: #64748b; font-size: 13px; line-height: 1.6;">
          Need immediate assistance? Feel free to reach out to us at:
        </p>
        <p style="color: #475569; font-size: 13px; font-weight: bold; margin: 8px 0 0 0;">
          📞 +91 90009 30453 / +91 90002 43270
        </p>
        <p style="color: #475569; font-size: 13px; font-weight: bold; margin: 4px 0 0 0;">
          ✉️ support@deccanfilings.com
        </p>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
        <p style="color: #94a3b8; font-size: 11px; margin-bottom: 0;">
          © 2026 Deccan Filings. All rights reserved. <br/>
          Owned and operated by TOR BUSINESS SOLUTIONS PRIVATE LIMITED.
        </p>
      </div>
    </div>
  `;

  await sendEmail(email, subject, textBody, userId, undefined, htmlBody);

  if (phone) {
    const smsMessage = `Hi ${name}, welcome to Deccan Filings! We're excited to partner with you. Track your business filings & consult experts at deccanfilings.com.`;
    await sendSMS(phone, smsMessage, userId);
    await sendWhatsAppTemplate(phone, 'utility_welcome', [name], userId);
  }
}

/**
 * Send Marketing Drip Emails and WhatsApp
 */
export async function sendMarketingEmail(
  name: string,
  email: string,
  phone: string,
  serviceName: string,
  step: number
): Promise<void> {
  let subject = '';
  let textBody = '';
  let templateName = '';
  let templateParams: string[] = [];

  if (step === 0) {
    subject = `We received your request, ${name}!`;
    textBody = `Hi ${name},\n\nThank you for requesting a callback regarding ${serviceName}. Our team of CA/CS experts has received your request and will be reaching out to you shortly.\n\nIn the meantime, feel free to reply to this email if you have any immediate questions!\n\nBest regards,\nTeam Deccan Filings`;
    templateName = 'marketing_drip_day_0';
    templateParams = [name, serviceName];
  } else if (step === 1) {
    subject = `Everything you need to know about ${serviceName}`;
    textBody = `Hi ${name},\n\nYesterday you asked about ${serviceName}. We know that compliance can be confusing, so we wanted to share a quick tip: The most important thing when starting with ${serviceName} is having your basic documents (PAN, Aadhaar, and Address Proof) ready. This can speed up your processing time by up to 40%!\n\nOur team is here to help you get everything sorted without the headache. Let us know when you're ready to proceed.\n\nBest regards,\nTeam Deccan Filings`;
    templateName = 'marketing_drip_day_1';
    templateParams = [name, serviceName];
  } else if (step === 3) {
    subject = `Why 10,000+ Founders Trust Deccan Filings 🚀`;
    textBody = `Hi ${name},\n\nStill thinking about ${serviceName}? We get it, choosing the right compliance partner is a big decision. Here is why founders across India trust us:\n1. 100% Online Process: No office visits required.\n2. Expert CA/CS Support: We don't just file forms; we offer strategic advice.\n3. Transparent Pricing: No hidden fees, ever.\n\nReady to take the next step? Reply to this email or call us directly!\n\nBest regards,\nTeam Deccan Filings`;
    templateName = 'marketing_drip_day_3';
    templateParams = [serviceName, name]; // As per your template design
  } else if (step === 7) {
    subject = `Final Follow-up: Let's get your ${serviceName} sorted`;
    textBody = `Hi ${name},\n\nWe haven't heard from you in a few days regarding your interest in ${serviceName}. If you've already found a solution, that's great! If you're still on the fence or have questions holding you back, we'd love to chat. You can schedule a free 15-minute consultation with one of our senior experts by replying to this email. We're here when you need us.\n\nBest regards,\nTeam Deccan Filings`;
    templateName = 'marketing_drip_day_7';
    templateParams = [name, serviceName];
  } else {
    return; // No email for this step
  }

  await sendEmail(email, subject, textBody);
  if (phone) {
    await sendWhatsAppTemplate(phone, templateName, templateParams);
  }
}

