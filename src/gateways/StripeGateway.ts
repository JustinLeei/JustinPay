import { PaymentGateway, PaymentGatewayConfig, PaymentParams, PaymentResult } from '../interfaces/PaymentGateway';

/**
 * Stripe支付网关配置
 */
interface StripeConfig extends PaymentGatewayConfig {
  publicKey: string; // Stripe公钥
}

/**
 * Stripe支付网关实现
 */
export class StripeGateway implements PaymentGateway {
  private stripe: any = null;
  private config: StripeConfig | null = null;
  private elements: any = null;
  private paymentElement: any = null;

  /**
   * 检查Stripe.js是否已加载
   */
  private static isStripeJsLoaded(): boolean {
    return typeof window !== 'undefined' && (window as any).Stripe !== undefined;
  }

  /**
   * 加载Stripe.js
   */
  private async loadStripeJs(): Promise<void> {
    if (StripeGateway.isStripeJsLoaded()) {
      return;
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://js.stripe.com/v3/';
      script.async = true;
      
      script.onload = () => {
        // 初始化Stripe实例
        this.stripe = (window as any).Stripe(this.config!.publicKey);
        resolve();
      };
      script.onerror = () => reject(new Error('加载Stripe JS SDK失败'));
      
      document.head.appendChild(script);
    });
  }

  async initialize(config: StripeConfig): Promise<void> {
    this.config = config;

    // 加载Stripe.js
    if (!StripeGateway.isStripeJsLoaded()) {
      await this.loadStripeJs();
    } else {
      // 如果已加载，直接初始化Stripe实例
      this.stripe = (window as any).Stripe(config.publicKey);
    }

    // 初始化UI元素
    const container = document.getElementById(config.containerId);
    if (!container) {
      throw new Error(`未找到容器元素: ${config.containerId}`);
    }

    // 创建支付表单
    container.innerHTML = `
      <form id="payment-form">
        <div id="payment-element"></div>
        <div id="error-message" style="color: #df1b41; margin-top: 8px;"></div>
        <button type="submit" id="submit-button" style="margin-top: 16px; padding: 8px 16px;">
          支付
        </button>
      </form>
    `;

    // 创建支付元素
    this.elements = this.stripe.elements({
      appearance: {
        theme: 'stripe',
        ...config.style,
      },
      locale: 'zh',
    });

    // 创建支付元素并挂载
    this.paymentElement = this.elements.create('payment');
    this.paymentElement.mount('#payment-element');
  }

  async createPayment(params: PaymentParams): Promise<PaymentResult> {
    if (!this.stripe || !this.config) {
      throw new Error('Stripe未初始化');
    }

    try {
      // 创建PaymentIntent
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: Math.round(params.amount * 100), // Stripe使用最小货币单位
          currency: params.currency.toLowerCase(),
          description: params.description,
          metadata: params.metadata,
        }),
      });

      const { clientSecret } = await response.json();

      // 创建支付表单
      await this.createPaymentForm(clientSecret, params);

      return {
        success: true,
        transactionId: '', // 支付完成后会更新
        amount: params.amount,
        currency: params.currency,
        status: 'pending',
        metadata: params.metadata,
      };
    } catch (error) {
      return {
        success: false,
        transactionId: '',
        amount: params.amount,
        currency: params.currency,
        status: 'failed',
        error: error instanceof Error ? error.message : '未知错误',
        metadata: params.metadata,
      };
    }
  }

  async verifyPayment(paymentId: string): Promise<PaymentResult> {
    if (!this.stripe) {
      throw new Error('Stripe未初始化');
    }

    try {
      const response = await fetch(`/api/verify-payment/${paymentId}`);
      const paymentIntent = await response.json();

      return {
        success: paymentIntent.status === 'succeeded',
        transactionId: paymentIntent.id,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency,
        status: paymentIntent.status,
        metadata: paymentIntent.metadata,
      };
    } catch (error) {
      return {
        success: false,
        transactionId: paymentId,
        amount: 0,
        currency: '',
        status: 'failed',
        error: error instanceof Error ? error.message : '未知错误',
      };
    }
  }

  async refund(paymentId: string, amount?: number): Promise<PaymentResult> {
    try {
      const response = await fetch('/api/refund', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentId,
          amount: amount ? Math.round(amount * 100) : undefined,
        }),
      });

      const refund = await response.json();

      return {
        success: true,
        transactionId: refund.id,
        amount: refund.amount / 100,
        currency: refund.currency,
        status: refund.status,
        metadata: refund.metadata,
      };
    } catch (error) {
      return {
        success: false,
        transactionId: paymentId,
        amount: amount || 0,
        currency: '',
        status: 'failed',
        error: error instanceof Error ? error.message : '未知错误',
      };
    }
  }

  async destroy(): Promise<void> {
    if (this.paymentElement) {
      this.paymentElement.destroy();
    }
    this.elements = null;
    this.paymentElement = null;
    this.config = null;
  }

  /**
   * 创建支付表单
   */
  private async createPaymentForm(clientSecret: string, params: PaymentParams): Promise<void> {
    if (!this.stripe || !this.config) {
      throw new Error('Stripe未初始化');
    }

    const container = document.getElementById(this.config.containerId);
    if (!container) {
      throw new Error(`未找到容器元素: ${this.config.containerId}`);
    }

    // 创建Stripe Elements
    this.elements = this.stripe.elements({
      clientSecret,
      appearance: {
        theme: 'stripe',
        ...this.config.style,
      },
      locale: 'zh',
    });

    // 创建支付表单
    container.innerHTML = `
      <form id="payment-form">
        <div id="payment-element"></div>
        <div id="error-message" style="color: #df1b41; margin-top: 8px;"></div>
        <button type="submit" id="submit-button" style="margin-top: 16px; padding: 8px 16px;">
          支付
        </button>
      </form>
    `;

    // 创建支付元素
    this.paymentElement = this.elements.create('payment', {
      layout: { type: 'tabs', defaultCollapsed: false },
      defaultValues: {
        billingDetails: {
          name: params.metadata?.customerName,
          email: params.metadata?.customerEmail,
          phone: params.metadata?.customerPhone,
        },
      },
    });

    // 挂载支付元素
    this.paymentElement.mount('#payment-element');

    // 处理表单提交
    const form = document.getElementById('payment-form') as HTMLFormElement;
    const submitButton = document.getElementById('submit-button') as HTMLButtonElement;
    const errorElement = document.getElementById('error-message');

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      submitButton.disabled = true;

      try {
        const { error } = await this.stripe.confirmPayment({
          elements: this.elements!,
          confirmParams: {
            return_url: params.returnUrl || window.location.href,
          },
          redirect: 'if_required',
        });

        if (error) {
          if (errorElement) {
            errorElement.textContent = error.message || '支付失败';
          }
          this.config?.onError?.(error);
        } else {
          const result = await this.stripe.retrievePaymentIntent(clientSecret);
          this.config?.onSuccess?.(result);
        }
      } catch (e) {
        if (errorElement) {
          errorElement.textContent = '支付过程中发生错误';
        }
        this.config?.onError?.(e);
      } finally {
        submitButton.disabled = false;
      }
    });
  }
} 