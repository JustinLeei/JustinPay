/**
 * 支付网关配置接口
 */
export interface PaymentGatewayConfig {
  // 基础配置
  apiKey: string;
  publicKey?: string;
  environment?: 'sandbox' | 'production';
  
  // UI配置
  containerId: string;
  style?: Record<string, any>;
  
  // 回调函数
  onSuccess?: (result: any) => void;
  onError?: (error: any) => void;
  onCancel?: () => void;
}

/**
 * 支付参数接口
 */
export interface PaymentParams {
  amount: number;
  currency: string;
  description?: string;
  metadata?: Record<string, any>;
  returnUrl?: string;
}

/**
 * 支付结果接口
 */
export interface PaymentResult {
  success: boolean;
  transactionId: string;
  amount: number;
  currency: string;
  status: string;
  error?: string;
  metadata?: Record<string, any>;
}

/**
 * 支付网关接口
 * 所有支付提供商都需要实现这个接口
 */
export interface PaymentGateway {
  /**
   * 初始化支付网关
   * @param config 支付网关配置
   */
  initialize(config: PaymentGatewayConfig): Promise<void>;
  
  /**
   * 创建支付
   * @param params 支付参数
   */
  createPayment(params: PaymentParams): Promise<PaymentResult>;
  
  /**
   * 验证支付状态
   * @param paymentId 支付ID
   */
  verifyPayment(paymentId: string): Promise<PaymentResult>;
  
  /**
   * 退款
   * @param paymentId 支付ID
   * @param amount 退��金额（可选）
   */
  refund(paymentId: string, amount?: number): Promise<PaymentResult>;
  
  /**
   * 销毁支付实例
   */
  destroy?(): Promise<void>;
} 