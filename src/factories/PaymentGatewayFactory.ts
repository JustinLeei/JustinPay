import { PaymentGateway } from '../interfaces/PaymentGateway';
import { StripeGateway } from '../gateways/StripeGateway';
import { PaddleGateway } from '../gateways/PaddleGateway';

/**
 * 支付网关类型
 */
export type PaymentGatewayType = 'stripe' | 'paddle' | 'custom';

/**
 * 支付网关工厂类
 * 用于创建和管理不同的支付网关实例
 */
export class PaymentGatewayFactory {
  private static instance: PaymentGatewayFactory;
  private gateways: Map<string, new () => PaymentGateway>;

  private constructor() {
    this.gateways = new Map();
    
    // 注册默认支付网关
    this.register('stripe', StripeGateway);
    this.register('paddle', PaddleGateway);
  }

  /**
   * 获取工厂单例
   */
  public static getInstance(): PaymentGatewayFactory {
    if (!PaymentGatewayFactory.instance) {
      PaymentGatewayFactory.instance = new PaymentGatewayFactory();
    }
    return PaymentGatewayFactory.instance;
  }

  /**
   * 注册新的支付网关
   * @param type 支付网关类型
   * @param gatewayClass 支付网关类
   */
  public register(type: string, gatewayClass: new () => PaymentGateway): void {
    this.gateways.set(type, gatewayClass);
  }

  /**
   * 创建支付网关实例
   * @param type 支付网关类型
   * @throws Error 如果支付网关类型未注册
   */
  public create(type: PaymentGatewayType): PaymentGateway {
    const GatewayClass = this.gateways.get(type);
    if (!GatewayClass) {
      throw new Error(`未注册的支付网关类型: ${type}`);
    }
    return new GatewayClass();
  }

  /**
   * 获取所有已注册的支付网关类型
   */
  public getRegisteredGateways(): string[] {
    return Array.from(this.gateways.keys());
  }
} 