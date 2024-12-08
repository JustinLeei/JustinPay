import { PaymentGateway, PaymentGatewayConfig, PaymentParams, PaymentResult } from '../interfaces/PaymentGateway';

/**
 * Paddle支付网关配置
 */
interface PaddleConfig extends PaymentGatewayConfig {
  vendorId: string; // Paddle商家ID
}

/**
 * Paddle支付网关实现
 */
export class PaddleGateway implements PaymentGateway {
  private paddle: any = null;
  private config: PaddleConfig | null = null;
  private checkoutInstance: any = null;

  /**
   * 检查Paddle.js是否已加载
   */
  private static isPaddleJsLoaded(): boolean {
    return typeof window !== 'undefined' && (window as any).Paddle !== undefined;
  }

  /**
   * 加载Paddle.js
   */
  private async loadPaddleJs(): Promise<void> {
    if (PaddleGateway.isPaddleJsLoaded()) {
      return;
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdn.paddle.com/paddle/paddle.js';
      script.async = true;
      script.defer = true;
      
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('加载Paddle JS SDK失败'));
      
      document.head.appendChild(script);
    });
  }

  async initialize(config: PaddleConfig): Promise<void> {
    this.config = config;

    // 加载Paddle.js
    await this.loadPaddleJs();
    
    // 初始化Paddle
    (window as any).Paddle.Environment.set(config.environment || 'sandbox');
    (window as any).Paddle.Setup({ 
      vendor: config.vendorId,
      eventCallback: (event: any) => {
        switch (event.name) {
          case 'checkout.complete':
            this.config?.onSuccess?.(event.data);
            break;
          case 'checkout.error':
            this.config?.onError?.(event.data);
            break;
          case 'checkout.close':
            this.config?.onCancel?.();
            break;
        }
      }
    });

    // 初始化UI元素
    const container = document.getElementById(config.containerId);
    if (!container) {
      throw new Error(`未找到容器元素: ${config.containerId}`);
    }
  }

  async createPayment(params: PaymentParams): Promise<PaymentResult> {
    if (!this.config) {
      throw new Error('Paddle未初始化');
    }

    try {
      // 创建结账配置
      const checkoutParams = {
        title: params.description || '支付',
        custom_message: params.description,
        amount: params.amount,
        currency: params.currency,
        passthrough: JSON.stringify(params.metadata || {}),
        success: this.config.onSuccess,
        closeCallback: this.config.onCancel,
        loadCallback: () => {
          // 支付界面加载完成
        },
        locale: 'zh',
        displayMode: 'inline',
        frameTarget: this.config.containerId,
        frameStyle: {
          width: '100%',
          height: '100%',
          ...this.config.style
        }
      };

      // 打开Paddle结账界面
      this.checkoutInstance = (window as any).Paddle.Checkout.open(checkoutParams);

      return {
        success: true,
        transactionId: '', // 由Paddle回调提供
        amount: params.amount,
        currency: params.currency,
        status: 'pending',
        metadata: params.metadata
      };
    } catch (error) {
      return {
        success: false,
        transactionId: '',
        amount: params.amount,
        currency: params.currency,
        status: 'failed',
        error: error instanceof Error ? error.message : '未知错误',
        metadata: params.metadata
      };
    }
  }

  async verifyPayment(paymentId: string): Promise<PaymentResult> {
    try {
      const response = await fetch(`/api/paddle/verify-payment/${paymentId}`);
      const transaction = await response.json();

      return {
        success: transaction.status === 'completed',
        transactionId: transaction.id,
        amount: transaction.amount,
        currency: transaction.currency,
        status: transaction.status,
        metadata: transaction.metadata
      };
    } catch (error) {
      return {
        success: false,
        transactionId: paymentId,
        amount: 0,
        currency: '',
        status: 'failed',
        error: error instanceof Error ? error.message : '未知错误'
      };
    }
  }

  async refund(paymentId: string, amount?: number): Promise<PaymentResult> {
    try {
      const response = await fetch('/api/paddle/refund', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          paymentId,
          amount,
          reason: 'customer_request'
        })
      });

      const refund = await response.json();

      return {
        success: true,
        transactionId: refund.id,
        amount: refund.amount,
        currency: refund.currency,
        status: refund.status,
        metadata: refund.metadata
      };
    } catch (error) {
      return {
        success: false,
        transactionId: paymentId,
        amount: amount || 0,
        currency: '',
        status: 'failed',
        error: error instanceof Error ? error.message : '未知错误'
      };
    }
  }

  async destroy(): Promise<void> {
    if (this.checkoutInstance) {
      this.checkoutInstance.close();
    }
    this.checkoutInstance = null;
    this.config = null;
  }

  // 实现缺失的方法
  async createPaymentSession(amount: number, currency: string): Promise<string> {
    const result = await this.createPayment({
      amount,
      currency,
      description: 'Payment Session'
    });
    return result.transactionId;
  }

  getConfig(): any {
    if (!this.config) {
      throw new Error('Paddle未初始化');
    }
    return {
      vendorId: this.config.vendorId,
      containerId: this.config.containerId,
      environment: this.config.environment
    };
  }
} 