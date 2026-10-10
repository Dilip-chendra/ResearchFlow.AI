import { db } from '../db/store';
import { razorpayClient } from './razorpayClient';
import { getPlanById } from './planCatalog';
import {
  BillingOrder,
  BillingTransaction,
  UserSubscription,
  WebhookEventRecord,
  BillingInterval,
  SubscriptionPlan,
} from '../types';
import { logger } from '../utils/logger';

export interface CreateCheckoutOrderInput {
  workspaceId: string;
  userId: string;
  planId: string;
  interval: BillingInterval;
}

export interface VerifyPaymentInput {
  orderId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
  workspaceId: string;
  userId: string;
}

export class RazorpayService {
  /**
   * Creates an order for Razorpay Standard Checkout.
   */
  public async createCheckoutOrder(input: CreateCheckoutOrderInput): Promise<{
    orderId: string;
    razorpayOrderId: string;
    amountINR: number;
    currency: string;
    keyId: string;
    plan: SubscriptionPlan;
    isFreePlan?: boolean;
  }> {
    const plan = getPlanById(input.planId);
    if (!plan) {
      throw new Error(`Invalid plan identifier: ${input.planId}`);
    }

    const price = input.interval === 'YEARLY' ? plan.yearlyPriceINR : plan.monthlyPriceINR;

    // Handle Free Plan immediate activation
    if (price === 0) {
      const sub: UserSubscription = {
        id: `sub_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        workspaceId: input.workspaceId,
        userId: input.userId,
        planId: plan.id,
        tier: plan.tier,
        aiMode: plan.aiMode,
        interval: input.interval,
        status: 'ACTIVE',
        currentPeriodStart: new Date().toISOString(),
        currentPeriodEnd: new Date(Date.now() + 30 * 86400000).toISOString(),
        cancelAtPeriodEnd: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      db.setSubscription(sub);
      logger.info(`Workspace ${input.workspaceId} enrolled directly into Free tier.`);
      return {
        orderId: `free_${Date.now()}`,
        razorpayOrderId: `free_${Date.now()}`,
        amountINR: 0,
        currency: 'INR',
        keyId: razorpayClient.getKeyId(),
        plan,
        isFreePlan: true,
      };
    }

    const receipt = `rcpt_rf_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;

    // Call Razorpay REST API
    const rzpOrder = await razorpayClient.createOrder({
      amountINR: price,
      currency: 'INR',
      receipt,
      notes: {
        app: 'researchflow_ai',
        workspaceId: input.workspaceId,
        userId: input.userId,
        planId: plan.id,
        interval: input.interval,
        tier: plan.tier,
        aiMode: plan.aiMode,
      },
    });

    const localOrder: BillingOrder = {
      id: `ord_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      workspaceId: input.workspaceId,
      userId: input.userId,
      planId: plan.id,
      tier: plan.tier,
      aiMode: plan.aiMode,
      interval: input.interval,
      amountINR: price,
      currency: 'INR',
      razorpayOrderId: rzpOrder.id,
      receipt,
      status: 'CREATED',
      notes: {
        app: 'researchflow_ai',
        workspaceId: input.workspaceId,
        userId: input.userId,
        planId: plan.id,
        interval: input.interval,
      },
      createdAt: new Date().toISOString(),
    };

    db.createBillingOrder(localOrder);

    return {
      orderId: localOrder.id,
      razorpayOrderId: rzpOrder.id,
      amountINR: price,
      currency: 'INR',
      keyId: razorpayClient.getKeyId(),
      plan,
    };
  }

  /**
   * Verifies cryptographic signature and fulfills subscription activation.
   */
  public async verifyAndFulfillPayment(input: VerifyPaymentInput): Promise<{
    success: boolean;
    subscription: UserSubscription;
    transaction: BillingTransaction;
  }> {
    const isValidSignature = razorpayClient.verifyPaymentSignature({
      orderId: input.razorpayOrderId,
      paymentId: input.razorpayPaymentId,
      signature: input.razorpaySignature,
    });

    if (!isValidSignature) {
      logger.error(`Cryptographic signature verification failed for payment: ${input.razorpayPaymentId}`);
      throw new Error('Payment signature verification failed. Possible tampering detected.');
    }

    const order =
      db.getBillingOrder(input.orderId) ||
      db.getBillingOrderByRazorpayId(input.razorpayOrderId);

    if (!order) {
      throw new Error(`Order not found for Razorpay order ID ${input.razorpayOrderId}`);
    }

    const plan = getPlanById(order.planId);
    if (!plan) {
      throw new Error(`Plan ${order.planId} not recognized`);
    }

    // Mark order paid
    db.updateBillingOrderStatus(order.id, 'PAID', new Date().toISOString());

    // Record successful transaction
    const tx: BillingTransaction = {
      id: `tx_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      orderId: order.id,
      workspaceId: order.workspaceId,
      userId: input.userId || order.userId,
      planId: order.planId,
      amountINR: order.amountINR,
      currency: 'INR',
      razorpayPaymentId: input.razorpayPaymentId,
      razorpayOrderId: input.razorpayOrderId,
      status: 'SUCCESS',
      createdAt: new Date().toISOString(),
    };
    db.createBillingTransaction(tx);

    // Calculate subscription duration
    const daysToAdd = order.interval === 'YEARLY' ? 365 : 30;
    const now = new Date();
    const periodEnd = new Date(now.getTime() + daysToAdd * 86400000);

    const subscription: UserSubscription = {
      id: `sub_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      workspaceId: order.workspaceId,
      userId: order.userId,
      planId: plan.id,
      tier: plan.tier,
      aiMode: plan.aiMode,
      interval: order.interval,
      status: 'ACTIVE',
      currentPeriodStart: now.toISOString(),
      currentPeriodEnd: periodEnd.toISOString(),
      cancelAtPeriodEnd: false,
      razorpayPaymentId: input.razorpayPaymentId,
      razorpayOrderId: input.razorpayOrderId,
      lastPaymentAmountINR: order.amountINR,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    db.setSubscription(subscription);

    // Reset quota for fresh billing cycle
    db.resetMonthlyQuota(order.workspaceId);

    logger.info(`Subscription successfully activated for workspace ${order.workspaceId} on plan ${plan.name}`);

    return {
      success: true,
      subscription,
      transaction: tx,
    };
  }

  /**
   * Handles incoming Razorpay webhook with signature verification and Veyra AI isolation.
   */
  public async handleWebhook(rawBody: string | Buffer, signature: string): Promise<{
    processed: boolean;
    ignored?: boolean;
    reason?: string;
  }> {
    const isValid = razorpayClient.verifyWebhookSignature(rawBody, signature);
    if (!isValid) {
      logger.warn('Razorpay webhook HMAC signature verification failed.');
      throw new Error('Invalid webhook signature');
    }

    const payload = typeof rawBody === 'string' ? JSON.parse(rawBody) : JSON.parse(rawBody.toString('utf-8'));
    const eventId = payload.event_id || payload.id || `evt_${Date.now()}`;
    const eventType = payload.event;

    // Check duplicate event idempotency
    const existing = db.getWebhookEvent(eventId);
    if (existing && existing.processed) {
      logger.info(`Webhook event ${eventId} already processed.`);
      return { processed: true, ignored: true, reason: 'Already processed' };
    }

    // Veyra AI merchant isolation check:
    // Only process events that belong to ResearchFlow AI notes
    const paymentNotes = payload.payload?.payment?.entity?.notes || {};
    const orderNotes = payload.payload?.order?.entity?.notes || {};
    const appTag = paymentNotes.app || orderNotes.app;

    if (appTag !== 'researchflow_ai') {
      logger.info(`Webhook event ${eventType} ignored: not tagged for researchflow_ai (tag: ${appTag || 'none'})`);
      db.saveWebhookEvent({
        id: eventId,
        eventId,
        eventType,
        payload,
        processed: true,
        processedAt: new Date().toISOString(),
        error: 'Ignored: Non-ResearchFlow AI merchant payload',
      });
      return { processed: true, ignored: true, reason: 'Non-ResearchFlow AI payload' };
    }

    logger.info(`Processing verified ResearchFlow AI webhook event: ${eventType}`);

    try {
      if (eventType === 'payment.captured') {
        const payment = payload.payload.payment.entity;
        const rzpOrderId = payment.order_id;
        const paymentId = payment.id;
        const workspaceId = paymentNotes.workspaceId || orderNotes.workspaceId;
        const userId = paymentNotes.userId || orderNotes.userId;

        if (rzpOrderId) {
          const order = db.getBillingOrderByRazorpayId(rzpOrderId);
          if (order && order.status !== 'PAID') {
            await this.verifyAndFulfillPayment({
              orderId: order.id,
              razorpayOrderId: rzpOrderId,
              razorpayPaymentId: paymentId,
              razorpaySignature: '', // Internal fulfillment via webhook
              workspaceId,
              userId,
            }).catch((err) => {
              // Signature check would fail on empty sig if called directly, so fulfill manual
              db.updateBillingOrderStatus(order.id, 'PAID', new Date().toISOString());
              const plan = getPlanById(order.planId);
              if (plan) {
                const days = order.interval === 'YEARLY' ? 365 : 30;
                db.setSubscription({
                  id: `sub_${Date.now()}`,
                  workspaceId: order.workspaceId,
                  userId: order.userId,
                  planId: plan.id,
                  tier: plan.tier,
                  aiMode: plan.aiMode,
                  interval: order.interval,
                  status: 'ACTIVE',
                  currentPeriodStart: new Date().toISOString(),
                  currentPeriodEnd: new Date(Date.now() + days * 86400000).toISOString(),
                  cancelAtPeriodEnd: false,
                  razorpayPaymentId: paymentId,
                  razorpayOrderId: rzpOrderId,
                  lastPaymentAmountINR: order.amountINR,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                });
              }
            });
          }
        }
      } else if (eventType === 'payment.failed') {
        const payment = payload.payload.payment.entity;
        const rzpOrderId = payment.order_id;
        if (rzpOrderId) {
          const order = db.getBillingOrderByRazorpayId(rzpOrderId);
          if (order) {
            db.updateBillingOrderStatus(order.id, 'FAILED');
            db.createBillingTransaction({
              id: `tx_${Date.now()}`,
              orderId: order.id,
              workspaceId: order.workspaceId,
              userId: order.userId,
              planId: order.planId,
              amountINR: order.amountINR,
              currency: 'INR',
              razorpayPaymentId: payment.id,
              razorpayOrderId: rzpOrderId,
              status: 'FAILED',
              errorDescription: payment.error_description || 'Payment failed',
              createdAt: new Date().toISOString(),
            });
          }
        }
      }

      db.saveWebhookEvent({
        id: eventId,
        eventId,
        eventType,
        payload,
        processed: true,
        processedAt: new Date().toISOString(),
      });

      return { processed: true };
    } catch (err: any) {
      logger.error(`Error processing webhook event ${eventType}:`, err);
      db.saveWebhookEvent({
        id: eventId,
        eventId,
        eventType,
        payload,
        processed: false,
        processedAt: new Date().toISOString(),
        error: err.message,
      });
      throw err;
    }
  }
}

export const razorpayService = new RazorpayService();
