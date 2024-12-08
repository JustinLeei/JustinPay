module.exports = {
  // 指定测试环境为jsdom，模拟浏览器环境
  testEnvironment: 'jsdom',
  
  // 支持TypeScript
  preset: 'ts-jest',
  
  // 测试文件匹配模式
  testMatch: [
    '**/__tests__/**/*.+(ts|tsx|js)',
    '**/?(*.)+(spec|test).+(ts|tsx|js)'
  ],
  
  // 测试覆盖率配置
  collectCoverage: true,
  coverageDirectory: 'coverage',
  
  // 设置模块别名
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  
  // 在每个测试文件之前运行的设置文件
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],

  // 设置默认超时时间（毫秒）
  testTimeout: 10000,

  // 设置测试环境变量
  testEnvironmentOptions: {
    url: 'http://localhost'
  },

  // 忽略特定目录
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/'
  ]
}; 