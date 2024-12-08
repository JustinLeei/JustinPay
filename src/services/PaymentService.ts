import { PaymentGateway } from '../interfaces/PaymentGateway';

// 支付服务类
export class PaymentService {
  constructor(private gateway: PaymentGateway) {}

  // 处理支付
  async processPayment(amount: number, currency: string = 'usd') {
    return await this.gateway.createPaymentSession(amount, currency);
  }

  // 验证支付
  async verifyPayment(sessionId: string) {
    return await this.gateway.verifyPayment(sessionId);
  }
} 