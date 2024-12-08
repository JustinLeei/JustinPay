import { Request, Response, Router } from 'express';
import { PaymentGateway, PaymentParams } from '../interfaces/PaymentGateway';

// 支付中间件类
export class PaymentMiddleware {
  private router: Router;
  
  constructor(private gateway: PaymentGateway) {
    this.router = Router();
    this.initializeRoutes();
  }

  // 初始化所有支付相关路由
  private initializeRoutes() {
    // 创建支付
    this.router.post('/payment', async (req: Request, res: Response) => {
      try {
        const params: PaymentParams = {
          amount: req.body.amount,
          currency: req.body.currency || 'usd',
          description: req.body.description,
          metadata: req.body.metadata,
          returnUrl: req.body.returnUrl
        };
        
        const result = await this.gateway.createPayment(params);
        res.json(result);
      } catch (error: any) {
        res.status(500).json({ error: error?.message || '支付创建失败' });
      }
    });

    // 验证支付
    this.router.get('/payment/:id/verify', async (req: Request, res: Response) => {
      try {
        const result = await this.gateway.verifyPayment(req.params.id);
        res.json(result);
      } catch (error: any) {
        res.status(500).json({ error: error?.message || '支付验证失败' });
      }
    });

    // 退款
    this.router.post('/payment/:id/refund', async (req: Request, res: Response) => {
      try {
        const result = await this.gateway.refund(req.params.id, req.body.amount);
        res.json(result);
      } catch (error: any) {
        res.status(500).json({ error: error?.message || '退款失败' });
      }
    });
  }

  // 获取路由中间件
  getRouter() {
    return this.router;
  }
} 