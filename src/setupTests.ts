import '@testing-library/jest-dom';

// 设置测试环境变量
process.env.NODE_ENV = 'test';
process.env.STRIPE_PUBLIC_KEY = 'pk_test_123';
process.env.STRIPE_SECRET_KEY = 'sk_test_123';

// 设置全局模拟
global.fetch = jest.fn();

// 设置全局超时
jest.setTimeout(10000);

// 清理函数
afterAll(() => {
  delete process.env.STRIPE_PUBLIC_KEY;
  delete process.env.STRIPE_SECRET_KEY;
}); 