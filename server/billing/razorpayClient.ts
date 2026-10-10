import crypto from 'crypto';
import { logger } from '../utils/logger';

export interface CreateOrderParams {
  amountINR: number;
  currency?: 'INR';
  receipt: string;
  notes: {
    app: 'researchflow_ai';
    workspaceId: string;
    userId: string;
    planId: string;
    interval: string;
    tier: string;
    aiMode: string;
    [key: string]: string;
  };
}

export interface RazorpayOrderResponse {
  id: string;
  entity: string;
  amount: number; // in paise (e.g. 99900 for ₹999)
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt: string;
  status: string;
  attempts: number;
  notes: Record<string, string>;
  created_at: number;
}

export interface RazorpayPaymentResponse {
  id: string;
  entity: string;
  amount: number;
  currency: string;
  status: 'captured' | 'authorized' | 'failed' | 'refunded';
  order_id: string;
  invoice_id?: string;
  international: boolean;
  method: string;
  amount_refunded: number;
  refund_status?: string;
  captured: boolean;
  description?: string;
  email?: string;
  contact?: string;
  notes: Record<string, string>;
  error_code?: string;
  error_description?: string;
  created_at: number;
}

export class RazorpayClient {
  private keyId: string;
  private keySecret: string;
  private webhookSecret: string;
  private apiBaseUrl: string = 'https://api.razorpay.com/v1';

  constructor() {
    this.keyId = process.env.RAZORPAY_KEY_ID || '';
    this.keySecret = process.env.RAZORPAY_KEY_SECRET || '';
    this.webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || '';

    if (!this.keyId || !this.keySecret) {
      logger.warn('Razorpay credentials not fully configured in environment variables.');
    }
  }

  public getKeyId(): string {
    return this.keyId;
  }

  public isConfigured(): boolean {
    return Boolean(this.keyId && this.keySecret);
  }

  private getAuthHeader(): string {
    const credentials = Buffer.from(`${this.keyId}:${this.keySecret}`).toString('base64');
    return `Basic ${credentials}`;
  }

  /**
   * Create an order on Razorpay for checkout.
   * Amount is converted to paise (INR * 100).
   */
  public async createOrder(params: CreateOrderParams): Promise<RazorpayOrderResponse> {
    if (!this.isConfigured()) {
      throw new Error('Razorpay API keys are not configured on the server.');
    }

    const amountInPaise = Math.round(params.amountINR * 100);

    const payload = {
      amount: amountInPaise,
      currency: params.currency || 'INR',
      receipt: params.receipt,
      notes: {
        ...params.notes,
        app: 'researchflow_ai', // Explicitly namespace to isolate from Veyra AI or other merchant apps
      },
    };

    logger.info(`Creating Razorpay order for receipt ${params.receipt}, amount: ₹${params.amountINR}`);

    const response = await fetch(`${this.apiBaseUrl}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: this.getAuthHeader(),
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errBody = await response.text();
      logger.error(`Razorpay order creation failed with status ${response.status}:`, errBody);
      throw new Error(`Razorpay order creation failed: ${errBody}`);
    }

    const data = (await response.json()) as RazorpayOrderResponse;
    logger.info(`Razorpay order created successfully: ${data.id}`);
    return data;
  }

  /**
   * Fetch payment details from Razorpay to verify status.
   */
  public async fetchPayment(paymentId: string): Promise<RazorpayPaymentResponse> {
    if (!this.isConfigured()) {
      throw new Error('Razorpay API keys are not configured on the server.');
    }

    const response = await fetch(`${this.apiBaseUrl}/payments/${paymentId}`, {
      method: 'GET',
      headers: {
        Authorization: this.getAuthHeader(),
      },
    });

    if (!response.ok) {
      const errBody = await response.text();
      logger.error(`Razorpay fetchPayment failed for ${paymentId}:`, errBody);
      throw new Error(`Failed to fetch payment details: ${errBody}`);
    }

    return (await response.json()) as RazorpayPaymentResponse;
  }

  /**
   * Cryptographically verify payment signature returned after checkout:
   * generated_signature = hmac_sha256(order_id + "|" + razorpay_payment_id, secret)
   */
  public verifyPaymentSignature(params: {
    orderId: string;
    paymentId: string;
    signature: string;
  }): boolean {
    if (!this.keySecret) {
      logger.error('Cannot verify payment signature: RAZORPAY_KEY_SECRET is missing');
      return false;
    }

    const payload = `${params.orderId}|${params.paymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', this.keySecret)
      .update(payload)
      .digest('hex');

    const isValid = crypto.timingSafeEqual(
      Buffer.from(expectedSignature, 'utf8'),
      Buffer.from(params.signature, 'utf8')
    );

    if (!isValid) {
      logger.warn(`Signature verification failed for order ${params.orderId}`);
    }

    return isValid;
  }

  /**
   * Cryptographically verify Razorpay Webhook signature using raw request body:
   * generated_signature = hmac_sha256(raw_body, webhook_secret)
   */
  public verifyWebhookSignature(rawBody: string | Buffer, signature: string): boolean {
    if (!this.webhookSecret) {
      logger.warn('RAZORPAY_WEBHOOK_SECRET is not configured. Webhook signature check failed.');
      return false;
    }

    try {
      const expectedSignature = crypto
        .createHmac('sha256', this.webhookSecret)
        .update(rawBody)
        .digest('hex');

      return crypto.timingSafeEqual(
        Buffer.from(expectedSignature, 'utf8'),
        Buffer.from(signature, 'utf8')
      );
    } catch (err) {
      logger.error('Error verifying webhook signature:', err);
      return false;
    }
  }
}

export const razorpayClient = new RazorpayClient();
