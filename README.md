# JustinPay

一个统一的支付集成库，提供统一的支付接口，支持多种支付提供商。目前支持：
- Stripe（已实现）
- Paddle（已实现）

## 安装

```bash
npm install justin-pay
```

## 使用方法

### 初始化支付网关

```typescript
import { PaymentGatewayFactory } from 'justin-pay';

// 获取支付网关工厂实例
const factory = PaymentGatewayFactory.getInstance();

// 创建Stripe支付网关
const stripeGateway = factory.create('stripe');
await stripeGateway.init({
  apiKey: 'your_stripe_api_key',
  containerId: 'payment-container', // 支付表单容器ID
  style: {
    // 自定义样式
  },
  onSuccess: (result) => {
    // 支付成功回调
  },
  onError: (error) => {
    // 支付失败回调
  }
});

// 创建Paddle支付网关
const paddleGateway = factory.create('paddle');
await paddleGateway.init({
  containerId: 'payment-container',
  style: {
    // 自定义样式
  },
  onSuccess: (result) => {
    // 支付成功回调
  },
  onCancel: () => {
    // 支付取消回调
  }
});
```

### 创建支付

```typescript
const paymentParams = {
  amount: 100,
  currency: 'USD',
  description: '测试支付',
  metadata: {
    orderId: '12345',
    customerName: '张三',
    customerEmail: 'zhangsan@example.com',
    customerPhone: '13800138000'
  },
  returnUrl: 'https://your-website.com/payment-result' // 支付完成后的跳转地址
};

const payment = await gateway.createPayment(paymentParams);
console.log('支付结果:', payment);
```

### 验证支付

```typescript
const verifyResult = await gateway.verifyPayment(payment.transactionId);
console.log('验证结果:', verifyResult);
```

### 退款

```typescript
// 全额退款
const refundResult = await gateway.refund(payment.transactionId);

// 部分退款
const partialRefundResult = await gateway.refund(payment.transactionId, 50);
console.log('退款结果:', refundResult);
```

## 支付结果格式

所有支付相关操作都会返回统一的 `PaymentResult` 格式：

```typescript
interface PaymentResult {
  success: boolean;
  transactionId: string;
  amount: number;
  currency: string;
  status: string;
  error?: string;
  metadata?: Record<string, any>;
}
```

## 特性

- 统一的支付接口，支持多种支付提供商
- 支持自定义UI样式
- 完整的TypeScript类型支持
- 支持支付结果回调
- 支持支付验证和退款
- 支持自定义元数据
- 内置错误处理

## 开发

```bash
# 安装依赖
npm install

# 构建
npm run build

# 运行测试
npm test
```

## 许可证

MIT 