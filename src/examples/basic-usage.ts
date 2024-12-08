import { PaymentGatewayFactory } from '../factories/PaymentGatewayFactory';
import { PaymentParams } from '../interfaces/PaymentGateway';

async function stripeExample() {
  // 获取支付网关工厂实例
  const factory = PaymentGatewayFactory.getInstance();

  // 创建Stripe支付网关
  const stripeGateway = factory.create('stripe');
  
  // 初始化支付网关
  await stripeGateway.initialize({
    apiKey: 'your_stripe_api_key',
    containerId: 'payment-form',
    environment: 'sandbox',
    onSuccess: (result) => {
      console.log('支付成功:', result);
    },
    onError: (error) => {
      console.error('支付失败:', error);
    }
  });

  // 创建支付
  const paymentParams: PaymentParams = {
    amount: 1000, // 金额（分）
    currency: 'CNY',
    description: '测试商品',
    metadata: {
      orderId: 'ORDER_123',
      productId: 'PROD_456'
    }
  };

  try {
    const result = await stripeGateway.createPayment(paymentParams);
    console.log('支付创建成功:', result);
    
    // 验证支付
    const verifyResult = await stripeGateway.verifyPayment(result.transactionId);
    console.log('支付验证结果:', verifyResult);
    
    // 退款示例
    if (verifyResult.success) {
      const refundResult = await stripeGateway.refund(result.transactionId, 500); // 退款一半
      console.log('退款结果:', refundResult);
    }
  } catch (error) {
    console.error('操作失败:', error);
  }
}

async function paddleExample() {
  const factory = PaymentGatewayFactory.getInstance();
  const paddleGateway = factory.create('paddle');
  
  await paddleGateway.initialize({
    apiKey: 'your_paddle_api_key',
    containerId: 'payment-form',
    environment: 'sandbox',
    onSuccess: (result) => {
      console.log('支付成功:', result);
    },
    onCancel: () => {
      console.log('支付已取消');
    }
  });

  const paymentParams: PaymentParams = {
    amount: 1000,
    currency: 'CNY',
    description: '测试商品',
    metadata: {
      orderId: 'ORDER_789'
    }
  };

  try {
    const result = await paddleGateway.createPayment(paymentParams);
    console.log('支付创建成功:', result);
  } catch (error) {
    console.error('操作失败:', error);
  }
}

// 运行示例
stripeExample().catch(console.error);
// paddleExample().catch(console.error); 