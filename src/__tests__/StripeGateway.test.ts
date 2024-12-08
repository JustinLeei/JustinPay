import { StripeGateway } from '../gateways/StripeGateway';
import { loadStripe } from '@stripe/stripe-js';

// 模拟 Stripe 相关模块
jest.mock('@stripe/stripe-js', () => ({
  loadStripe: jest.fn(),
}));

// 模拟 DOM 环境
const mockElements = {
  create: jest.fn().mockReturnValue({
    mount: jest.fn(),
    destroy: jest.fn(),
  }),
};

const mockStripeInstance = {
  elements: jest.fn().mockReturnValue(mockElements),
  confirmPayment: jest.fn(),
  retrievePaymentIntent: jest.fn(),
};

// 模拟 loadStripe 返回值
(loadStripe as jest.Mock).mockResolvedValue(mockStripeInstance);

describe('StripeGateway', () => {
  let gateway: StripeGateway;
  let config: any;

  beforeEach(() => {
    // 重置所有模拟函数
    jest.clearAllMocks();
    
    // 创建测试用的 DOM 元素
    document.body.innerHTML = `
      <div id="payment-container"></div>
    `;

    // 初始化配置
    config = {
      publicKey: 'pk_test_123',
      containerId: 'payment-container',
      onSuccess: jest.fn(),
      onError: jest.fn(),
      onCancel: jest.fn(),
    };

    gateway = new StripeGateway();
  });

  test('初始化 - 成功', async () => {
    await gateway.initialize(config);
    expect(loadStripe).toHaveBeenCalledWith(config.publicKey);
  });

  test('支付表单提交 - 成功', async () => {
    await gateway.initialize(config);

    // 模拟支付成功
    mockStripeInstance.confirmPayment.mockResolvedValue({ error: null });
    mockStripeInstance.retrievePaymentIntent.mockResolvedValue({
      paymentIntent: { id: 'pi_123', status: 'succeeded' }
    });

    const params = {
      amount: 100,
      currency: 'USD',
      description: 'Test payment',
      returnUrl: 'http://localhost/return',
      metadata: { orderId: '123' }
    };

    await gateway.createPayment(params);

    // 模拟表单提交
    const form = document.getElementById('payment-form');
    if (form) {
      const submitEvent = new Event('submit');
      form.dispatchEvent(submitEvent);

      // 等待异步操作完成
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(mockStripeInstance.confirmPayment).toHaveBeenCalled();
      expect(config.onSuccess).toHaveBeenCalled();
    }
  });

  // ... 其他测试用例 ...
}); 