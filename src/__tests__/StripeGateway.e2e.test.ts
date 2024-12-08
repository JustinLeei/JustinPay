import { StripeGateway } from '../gateways/StripeGateway';

// 模拟全局 fetch
const originalFetch = global.fetch;

// 设置更长的默认超时时间
jest.setTimeout(30000);

describe('StripeGateway E2E Tests', () => {
  let gateway: StripeGateway;
  
  beforeEach(() => {
    // 设置 DOM 环境
    document.body.innerHTML = `
      <div id="payment-container"></div>
    `;

    // 初始化网关
    gateway = new StripeGateway();
    
    // 模拟 fetch
    global.fetch = jest.fn().mockImplementation((url: string, options?: RequestInit) => {
      if (url.includes('/api/create-payment-intent')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ clientSecret: 'test_secret' })
        } as Response);
      }
      
      if (url.includes('/api/verify-payment')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            id: 'pi_123',
            status: 'succeeded',
            amount: 1000,
            currency: 'usd'
          })
        } as Response);
      }
      
      return originalFetch(url, options);
    });
  });

  afterEach(async () => {
    // 清理
    global.fetch = originalFetch;
    jest.clearAllMocks();
    
    // 等待任何未完成的操作
    await new Promise(resolve => setTimeout(resolve, 100));
  });

  test('完整支付流程', async () => {
    // 初始化配置
    const config = {
      publicKey: 'pk_test_123',
      apiKey: 'sk_test_456',
      containerId: 'payment-container',
      onSuccess: jest.fn(),
      onError: jest.fn()
    };

    await gateway.initialize(config);
    // 等待初始化完成
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 创建支付
    const paymentResult = await gateway.createPayment({
      amount: 10,
      currency: 'USD',
      description: 'Test payment',
      metadata: { orderId: '123' }
    });

    expect(paymentResult.success).toBe(true);
    expect(paymentResult.status).toBe('pending');

    // 等待支付处理
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 验证支付
    const verifyResult = await gateway.verifyPayment('pi_123');
    
    expect(verifyResult.success).toBe(true);
    expect(verifyResult.status).toBe('succeeded');
    expect(verifyResult.amount).toBe(10);
    expect(verifyResult.currency).toBe('usd');
  }, 30000); // 为这个测试单独设置超时时间

  test('处理网络错误', async () => {
    // 模拟网络错误
    global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

    const config = {
      publicKey: 'pk_test_123',
      apiKey: 'sk_test_456',
      containerId: 'payment-container',
      onError: jest.fn()
    };

    await gateway.initialize(config);
    await new Promise(resolve => setTimeout(resolve, 1000));

    const result = await gateway.createPayment({
      amount: 10,
      currency: 'USD',
      description: 'Test payment'
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain('Network error');
  }, 15000);

  test('处理无效响应', async () => {
    // 模拟无效响应
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: () => Promise.resolve({ error: 'Invalid request' })
    } as Response);

    const config = {
      publicKey: 'pk_test_123',
      apiKey: 'sk_test_456',
      containerId: 'payment-container',
      onError: jest.fn()
    };

    await gateway.initialize(config);
    await new Promise(resolve => setTimeout(resolve, 1000));

    const result = await gateway.verifyPayment('invalid_id');

    expect(result.success).toBe(false);
    expect(result.status).toBe('failed');
  }, 15000);
}); 