# JustinPay

一个统一的支付集成库，提供统一的支付接口，支持多种支付提供商。目前支持：
- Stripe（已实现）
- Paddle（已实现）

## 项目介绍

JustinPay 是一个现代化的支付集成解决方案，旨在简化多支付渠道的接入流程。通过统一的接口和类型定义，让开发者能够轻松地集成和切换不同的支付提供商。

### 项目结构

```
src/
├── interfaces/        # 接口定义
│   ├── PaymentGateway.ts    # 支付网关接口
│   ├── PaymentUI.ts         # UI相关接口
│   └── PaymentResult.ts     # 支付结果接口
├── gateways/         # 支付网关实现
│   ├── StripeGateway.ts     # Stripe支付实现
│   └── PaddleGateway.ts     # Paddle支付实现
├── factories/        # 工厂类
│   └── PaymentGatewayFactory.ts  # 支付网关工厂
├── utils/           # 工具函数
├── examples/        # 使用示例
└── index.ts         # 入口文件

tests/               # 测试文件
├── unit/           # 单元测试
└── integration/    # 集成测试
```

### 技术栈

- TypeScript: 提供完整的类型支持
- Webpack: 构建和打包
- Jest: 单元测试和集成测试
- ESLint & Prettier: 代码规范和格式化

### 设计理念

1. **统一接口**: 所有支付网关实现相同的接口，便于切换和扩展
2. **类型安全**: 使用 TypeScript 提供完整的类型定义和检查
3. **可扩展性**: 工厂模式使添加新的支付提供商变得简单
4. **错误处理**: 统一的错误处理机制，提供详细的错误信息
5. **UI灵活性**: 支持自定义支付界面样式

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

## 开发指南

### 环境要求

- Node.js >= 14
- npm >= 6

### 开发流程

1. 克隆仓库
```bash
git clone https://github.com/yourusername/justin-pay.git
cd justin-pay
```

2. 安装依赖
```bash
npm install
```

3. 启动开发环境
```bash
npm run dev
```

4. 运行测试
```bash
# 运行所有测试
npm test

# 运行单元测试
npm run test:unit

# 运行集成测试
npm run test:integration

# 查看测试覆盖率
npm run test:coverage
```

5. 构建
```bash
npm run build
```

### 贡献指南

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交改动 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

## 许可证

MIT 