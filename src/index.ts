// 导出接口
export * from './interfaces/PaymentGateway';

// 导出工厂类
export { PaymentGatewayFactory } from './factories/PaymentGatewayFactory';

// 导出具体实现（可选，如果用户需要直接使用特定实现）
export { StripeGateway } from './gateways/StripeGateway';
export { PaddleGateway } from './gateways/PaddleGateway'; 