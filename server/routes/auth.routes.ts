import { Router, Response } from 'express';
import * as authService from '../services/auth.service';
import * as userModel from '../models/user.model';
import { validateRegister, validateLogin } from '../schemas/validation.schema';
import { authenticate, AuthenticatedRequest } from '../middlewares/auth';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import * as notificationService from '../services/notification.service';

import { pool } from '../db';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'deccan-filings-secret-key-123';

/**
 * Log action utility
 */
async function logActivity(userId: number, action: string, details: string) {
  try {
    const user = await userModel.findUserById(userId);
    await pool.execute(
      'INSERT INTO activity_log (user_id, action, details, user_name, user_email) VALUES (?, ?, ?, ?, ?)',
      [userId, action, details, user?.name || 'System', user?.email || '']
    );
  } catch (error) {
    console.error("Failed to log activity:", error);
  }
}

/**
 * POST /api/auth/register
 */
router.post('/register', async (req, res, next) => {
  try {
    const validation = validateRegister(req.body);
    if (!validation.isValid) {
      return res.status(400).json({ error: 'Validation failed', details: validation.errors });
    }

    const result = await authService.register(req.body);
    
    // Log registration
    await logActivity(result.user.id, 'REGISTER', 'Registered new user account');

    // Send welcome notification (email + SMS)
    try {
      await notificationService.notifyWelcome(
        result.user.email,
        result.user.name,
        result.user.id,
        result.user.phone
      );
    } catch (notifErr) {
      console.error('Failed to dispatch welcome notification:', notifErr);
    }
    
    return res.status(201).json(result);
  } catch (error: any) {
    if (error.status) {
      return res.status(error.status).json({ error: error.message });
    }
    next(error);
  }
});

/**
 * POST /api/auth/login
 */
router.post('/login', async (req, res, next) => {
  try {
    const validation = validateLogin(req.body);
    if (!validation.isValid) {
      return res.status(400).json({ error: 'Validation failed', details: validation.errors });
    }

    const result = await authService.login(req.body);
    
    // Log login
    await logActivity(result.user.id, 'LOGIN', 'Logged into user portal');
    
    return res.json(result);
  } catch (error: any) {
    if (error.status) {
      return res.status(error.status).json({ error: error.message });
    }
    next(error);
  }
});

/**
 * POST /api/auth/google
 */
router.post('/google', async (req, res, next) => {
  const { credential } = req.body;
  if (!credential) {
    return res.status(400).json({ error: 'Google credential token is required' });
  }

  try {
    let email: string | undefined;
    let name: string | undefined;
    let picture: string | undefined;

    const clientId = process.env.GOOGLE_CLIENT_ID;
    
    // Check if we are running in verification bypass/simulation mode
    if (!clientId || clientId === 'YOUR_GOOGLE_CLIENT_ID' || credential.startsWith('mock_token_')) {
      console.log('[GOOGLE-AUTH-MOCK] Bypassing Google verification for local testing.');
      if (credential.startsWith('mock_token_')) {
        const parts = credential.split('_');
        email = parts[2] || 'mockuser@example.com';
        name = parts[3] ? `${parts[3]} ${parts[4] || ''}`.trim() : 'Mock User';
        picture = 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y';
      } else {
        email = 'mockuser@example.com';
        name = 'Mock User';
        picture = 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y';
      }
    } else {
      // Verify token with Google API client
      if (credential.split('.').length === 3) {
        const client = new OAuth2Client(clientId);
        const ticket = await client.verifyIdToken({
          idToken: credential,
          audience: clientId,
        });
        const payload = ticket.getPayload();
        if (!payload) {
          return res.status(400).json({ error: 'Invalid Google credential payload' });
        }
        email = payload.email;
        name = payload.name;
        picture = payload.picture;
      } else {
        // Verify access token
        try {
          const userinfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${credential}` }
          });
          if (userinfoRes.ok) {
            const payload = await userinfoRes.json() as any;
            email = payload.email;
            name = payload.name;
            picture = payload.picture;
          } else {
            return res.status(400).json({ error: 'Invalid Google access token' });
          }
        } catch (e: any) {
          return res.status(500).json({ error: 'Failed to verify access token with Google', details: e.message });
        }
      }
    }

    if (!email) {
      return res.status(400).json({ error: 'Google account does not provide an email' });
    }

    // Check database
    let user = await userModel.findUserByEmail(email);
    let isNewUser = false;

    if (user) {
      if (!user.avatar && picture) {
        await userModel.updateUserAvatar(user.id, picture);
        user.avatar = picture;
      }
    } else {
      isNewUser = true;
      // Create user
      const dummyPassword = Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-10);
      const hashedPassword = await bcrypt.hash(dummyPassword, 10);
      const userId = await userModel.createUser({
        name: name || 'Google User',
        email,
        password: hashedPassword,
        avatar: picture || null,
        role: 'user'
      });
      user = await userModel.findUserById(userId);
      await logActivity(userId, 'REGISTER_GOOGLE', 'Registered using Google OAuth');

      // Send welcome notification (email + SMS)
      if (user) {
        try {
          await notificationService.notifyWelcome(
            user.email,
            user.name,
            user.id,
            user.phone
          );
        } catch (notifErr) {
          console.error('Failed to dispatch welcome notification for Google user:', notifErr);
        }
      }
    }

    if (!user) {
      return res.status(500).json({ error: 'Failed to create user from Google profile.' });
    }

    await logActivity(user.id, 'LOGIN_GOOGLE', 'Signed in using Google OAuth');

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
    return res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar, phone: user.phone }, isNewUser });

  } catch (error: any) {
    console.error('Google Auth route error:', error);
    return res.status(500).json({ error: 'Google Authentication failed', details: error.message });
  }
});

/**
 * GET /api/auth/me
 */
router.get('/me', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    const user = await userModel.findUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User profile not found' });
    }
    return res.json(user);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/auth/forgot-password
 */
router.post('/forgot-password', async (req, res, next) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email address is required' });
  }

  try {
    const user = await userModel.findUserByEmail(email);
    if (!user) {
      return res.status(404).json({ error: 'No account found with this email address' });
    }

    // Generate a secure 32-byte hex token
    const token = crypto.randomBytes(32).toString('hex');
    // Set expiration to 1 hour from now
    const expiresAt = new Date(Date.now() + 3600000);

    await userModel.savePasswordResetToken(email, token, expiresAt);

    // Setup nodemailer transport
    let transporter: nodemailer.Transporter | null = null;
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
    }

    const resetLink = `https://www.deccanfilings.com/reset-password?token=${token}`;
    const fromEmail = process.env.SYSTEM_EMAIL_FROM || process.env.SMTP_USER || 'support@deccanfilings.com';

    const mailOptions = {
      from: `"Deccan Filings Support" <${fromEmail}>`,
      to: email,
      subject: 'Reset your Deccan Filings password',
      text: `Hello ${user.name},\n\nYou requested a password reset. Please click on the link below or copy and paste it into your browser to reset your password:\n\n${resetLink}\n\nThis link is valid for 1 hour.\n\nBest regards,\nDeccan Filings Support Team`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px 24px; background-color: #f8fafc; border-radius: 16px; border: 1px solid #e2e8f0;">
          <h2 style="color: #0f172a; font-size: 22px; font-weight: bold; margin-top: 0; margin-bottom: 16px; border-bottom: 2px solid #e2e8f0; padding-bottom: 16px;">Password Reset Request</h2>
          <p style="color: #334155; font-size: 16px; line-height: 1.6;">Hello ${user.name},</p>
          <p style="color: #334155; font-size: 16px; line-height: 1.6;">We received a request to reset the password for your Deccan Filings account. Click the button below to set a new password:</p>
          <div style="margin: 32px 0; text-align: center;">
            <a href="${resetLink}" style="background-color: #0f172a; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 12px; font-weight: bold; display: inline-block;">Reset Password</a>
          </div>
          <p style="color: #64748b; font-size: 14px; line-height: 1.6;">If the button above does not work, copy and paste this URL into your browser:</p>
          <p style="color: #2563eb; font-size: 14px; word-break: break-all;"><a href="${resetLink}" style="color: #2563eb; text-decoration: underline;">${resetLink}</a></p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 32px 0;" />
          <p style="color: #94a3b8; font-size: 13px; line-height: 1.6; margin-bottom: 0;">This link is valid for 1 hour. If you did not request a password reset, you can safely ignore this email.</p>
        </div>
      `
    };

    if (transporter) {
      await transporter.sendMail(mailOptions);
    } else {
      console.log('=== SMTP NOT CONFIGURABLE - PRINTING PASSWORD RESET MAIL ===');
      console.log(`To: ${email}`);
      console.log(`Reset Link: ${resetLink}`);
      console.log('============================================================');
    }

    return res.json({ success: true, message: 'Password reset link has been sent to your email.' });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/auth/reset-password
 */
router.post('/reset-password', async (req, res, next) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) {
    return res.status(400).json({ error: 'Token and new password are required' });
  }

  try {
    const user = await userModel.findUserByResetToken(token);
    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }

    // Hash the new password with bcrypt (cost factor of 10)
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await userModel.updateUserPassword(user.id, hashedPassword);

    // Clear token
    await pool.execute(
      'UPDATE users SET reset_password_token = NULL, reset_password_expires = NULL WHERE id = ?',
      [user.id]
    );

    // Log the password change activity
    await logActivity(user.id, 'PASSWORD_RESET', 'Successfully reset account password');

    return res.json({ success: true, message: 'Password has been reset successfully.' });
  } catch (error) {
    next(error);
  }
});

export default router;
