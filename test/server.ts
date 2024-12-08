import express from 'express';
import { StripeGateway } from '../src/gateways/StripeGateway';
import { PaymentMiddleware } from '../src/middleware/PaymentMiddleware';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

const app = express();
app.use(express.json());

// 使用测试密钥或环境变量
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || 'sk_test_your_test_key';
const STRIPE_PUBLIC_KEY = process.env.STRIPE_PUBLIC_KEY || 'pk_test_your_test_key';

console.log('使用的支付配置:', {
  secretKey: STRIPE_SECRET_KEY.substring(0, 8) + '...',
  publicKey: STRIPE_PUBLIC_KEY.substring(0, 8) + '...',
  mode: process.env.NODE_ENV || 'development'
});

// 初始化支付网关和中间件
const gateway = new StripeGateway({
  apiKey: STRIPE_SECRET_KEY,
  containerId: 'payment-container',
  environment: (process.env.NODE_ENV === 'production') ? 'production' : 'sandbox'
});

// 使用支付中间件
const paymentMiddleware = new PaymentMiddleware(gateway);
app.use('/api', paymentMiddleware.getRouter());

// 添加静态文件服务
app.use(express.static('public'));

// 健康检查端点
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
  console.log('可用的API端点:');
  console.log('- POST /api/payment         创建支付');
  console.log('- GET  /api/payment/:id     查询支付');
  console.log('- POST /api/payment/:id/refund 退款');
});