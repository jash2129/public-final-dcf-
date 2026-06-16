import fs from 'fs';
import path from 'path';
import { pool } from '../db';
import { formatCurrency } from '../utils/helpers';
import nodemailer from 'nodemailer';
import * as invoiceService from './invoice.service';

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
function logNotificationToFile(type: 'EMAIL' | 'SMS', recipient: string, subjectOrMessage: string, body?: string) {
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
  attachments?: any[]
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
  console.log(`[SMTP MOCK] Sending Email to ${to}:\nSubject: ${subject}\nBody: ${body}\n`);
  logNotificationToFile('EMAIL', to, subject, body);
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
  const formattedAmt = formatCurrency(amount);
  
  // Email
  const emailSubject = `Order Placed Successfully - ${orderId}`;
  const emailBody = `Hi ${userName},\n\n` +
                    `Thank you for choosing Deccan Filings! We have received your order.\n\n` +
                    `Order Details:\n` +
                    `- Order ID: ${orderId}\n` +
                    `- Services: ${serviceNames}\n` +
                    `- Total Amount: ${formattedAmt}\n` +
                    `- Status: Placed (Our experts will start working shortly)\n\n` +
                    `Best regards,\nTeam Deccan Filings`;
  await sendEmail(userEmail, emailSubject, emailBody, userId);

  // SMS
  const smsMessage = `Hi ${userName}, order ${orderId} for ${serviceNames} (Amt: ${formattedAmt}) has been placed successfully. Team Deccan Filings`;
  if (userPhone) {
    await sendSMS(userPhone, smsMessage, userId);
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

  // SMS
  const smsMessage = `Hi ${userName}, status of your order ${orderId} has been updated to ${statusDisplay}. Log in to dashboard to check. Team Deccan Filings`;
  if (userPhone) {
    await sendSMS(userPhone, smsMessage, userId);
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

  // SMS
  const smsMessage = status === 'overdue'
    ? `Hi ${userName}, compliance for ${taskTitle} was due on ${dueDate} and is OVERDUE. Please share documents immediately to avoid penalties. Team Deccan Filings`
    : `Hi ${userName}, compliance for ${taskTitle} is due on ${dueDate}. Please share required documents at the earliest. Team Deccan Filings`;

  if (userPhone) {
    await sendSMS(userPhone, smsMessage, userId);
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
  const formattedAmt = formatCurrency(amount);
  const emailSubject = `Payment Received - Invoice for Order ${orderId}`;
  const emailBody = `Hi ${userName},\n\n` +
                    `We are pleased to confirm that your payment of ${formattedAmt} for Order ${orderId} has been successfully received.\n\n` +
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
}
