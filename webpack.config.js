const path = require('path');

module.exports = {
  entry: {
    'payment-gateway': './src/index.ts',
    'test-script': './test/test-script.ts'
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
    library: {
      name: 'PaymentGateway',
      type: 'window',
      export: 'default'
    }
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js']
  }
};