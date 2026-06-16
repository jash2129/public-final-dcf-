import { Router } from 'express';
import express from 'express';
import * as paymentService from '../services/payment.service';

const router = Router();

/**
 * POST /api/webhooks/razorpay
 * Webhook listener for Razorpay payment captured events.
 * Uses express.raw middleware to preserve the raw payload buffer for signature validation.
 */
router.post(
  '/razorpay',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    try {
      const signature = req.headers['x-razorpay-signature'] as string;
      const rawString = req.body.toString('utf8');
      const payload = JSON.parse(rawString);

      await paymentService.processWebhook(rawString, signature, payload);

      res.status(200).json({ status: 'ok' });
    } catch (error: any) {
      console.error("Webhook processing failed:", error);
      res.status(400).json({ error: 'Webhook processing failed' });
    }
  }
);

export default router;
