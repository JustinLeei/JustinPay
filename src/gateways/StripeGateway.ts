import { PaymentGateway, PaymentGatewayConfig, PaymentParams, PaymentResult } from '../interfaces/PaymentGateway';
import Stripe from 'stripe';

// Stripe支付网关实现
export class StripeGateway implements PaymentGateway {
  private stripe: Stripe;
  private config: PaymentGatewayConfig;
  
  constructor(config: PaymentGatewayConfig) {
    this.config = config;
    this.stripe = new Stripe(config.apiKey, {
      apiVersion: '2023-08-16'  // 使用Stripe支持的API版本
    });
  }

  async initialize(config: PaymentGatewayConfig): Promise<void> {
    this.config = config;
    this.stripe = new Stripe(config.apiKey, {
      apiVersion: '2023-08-16'
    });
  }

  async createPayment(params: PaymentParams): Promise<PaymentResult> {
    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: params.currency,
          product_data: {
            name: params.description || 'Payment',
          },
          unit_amount: params.amount,
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: params.returnUrl || `${window.location.origin}/success`,
      cancel_url: `${window.location.origin}/cancel`,
      metadata: params.metadata,
    });

    return {
      success: true,
      transactionId: session.id,
      amount: params.amount,
      currency: params.currency,
      status: session.status || 'created',
      metadata: session.metadata ? session.metadata : undefined
    };
  }

  async createPaymentSession(amount: number, currency: string): Promise<string> {
    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: currency,
          product_data: {
            name: 'Payment',
          },
          unit_amount: amount,
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${window.location.origin}/success`,
      cancel_url: `${window.location.origin}/cancel`,
    });
    return session.id;
  }

  async verifyPayment(paymentId: string): Promise<PaymentResult> {
    const session = await this.stripe.checkout.sessions.retrieve(paymentId);
    return {
      success: session.payment_status === 'paid',
      transactionId: session.id,
      amount: session.amount_total || 0,
      currency: session.currency || 'usd',
      status: session.payment_status || 'unknown',
      metadata: session.metadata ? session.metadata : undefined
    };
  }

  async refund(paymentId: string, amount?: number): Promise<PaymentResult> {
    const refund = await this.stripe.refunds.create({
      payment_intent: paymentId,
      amount: amount
    });

    return {
      success: refund.status === 'succeeded',
      transactionId: refund.id,
      amount: refund.amount || 0,
      currency: refund.currency || 'usd',
      status: refund.status || 'unknown',
      metadata: refund.metadata ? refund.metadata : undefined
    };
  }

  getConfig(): any {
    return {
      publicKey: this.config.apiKey,
      containerId: this.config.containerId
    };
  }

  async destroy(): Promise<void> {
    // 清理资源
  }
} 