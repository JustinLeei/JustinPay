import { PaymentGatewayFactory } from '../src';
import { PaymentGatewayConfig } from '../src/interfaces/PaymentGateway';

// 显示测试结果
function showResult(title: string, data?: any) {
  const resultElement = document.getElementById('test-result');
  if (resultElement) {
    resultElement.innerHTML = `
      <h3>${title}</h3>
      <pre>${JSON.stringify(data, null, 2)}</pre>
    `;
  }
}

// 测试Stripe支付
async function testStripe() {
  const factory = PaymentGatewayFactory.getInstance();

  // 支付网关配置
  const config: PaymentGatewayConfig = {
    apiKey: 'pk_test_51NyUXXXXXXXXXXXX',
    containerId: 'payment-form',
    environment: 'sandbox',
    onSuccess: (result) => {
      showResult('Stripe支付成功', result);
    },
    onError: (error) => {
      showResult('Stripe支付失败', error);
    }
  };

  const stripeGateway = factory.create('stripe', config);
  
  try {
    // 初始化
    await stripeGateway.initialize(config);

    // 创建支付
    const result = await stripeGateway.createPayment({
      amount: 1000,
      currency: 'cny',
      description: '测试商品',
      metadata: {
        orderId: 'TEST_' + Date.now()
      }
    });

    showResult('创建支付结果', result);
  } catch (error) {
    showResult('测试出错', error instanceof Error ? error.message : String(error));
  }
}

// 测试Paddle支付
async function testPaddle() {
  const factory = PaymentGatewayFactory.getInstance();

  // 支付网关配置
  const config: PaymentGatewayConfig = {
    apiKey: 'your_paddle_api_key',
    containerId: 'payment-form',
    environment: 'sandbox',
    onSuccess: (result) => {
      showResult('Paddle支付成功', result);
    },
    onCancel: () => {
      showResult('Paddle支付已取消');
    }
  };

  const paddleGateway = factory.create('paddle', config);
  
  try {
    await paddleGateway.initialize(config);

    const result = await paddleGateway.createPayment({
      amount: 1000,
      currency: 'CNY',
      description: '测试商品',
      metadata: {
        orderId: 'TEST_' + Date.now()
      }
    });

    showResult('创建支付结果', result);
  } catch (error) {
    showResult('测试出错', error);
  }
}

// 导出到全局
const PaymentGateway = {
  testStripe,
  testPaddle,
  showResult
};

// 确保在浏览器环境下将方法挂载到window对象
if (typeof window !== 'undefined') {
  (window as any).PaymentGateway = PaymentGateway;
}

export default PaymentGateway;