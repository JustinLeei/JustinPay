/**
 * 支付UI配置接口
 */
export interface PaymentUIConfig {
  // 支付按钮的容器元素ID
  containerId: string;
  // 支付成功回调
  onSuccess?: (result: any) => void;
  // 支付失败回调
  onError?: (error: any) => void;
  // 支付取消回调
  onCancel?: () => void;
  // 自定义样式
  style?: Record<string, any>;
}

/**
 * 支付UI接口
 */
export interface PaymentUI {
  /**
   * 初始化支付UI
   */
  initialize(config: PaymentUIConfig): Promise<void>;

  /**
   * 显示支付界面
   */
  show(params: {
    amount: number;
    currency: string;
    description?: string;
    metadata?: Record<string, any>;
  }): Promise<void>;

  /**
   * 隐藏支付界面
   */
  hide(): Promise<void>;

  /**
   * 销毁支付界面
   */
  destroy(): Promise<void>;
} 