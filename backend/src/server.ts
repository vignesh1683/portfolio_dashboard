import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import stockRoutes from './routes/stockRoutes';

dotenv.config();

const app: Express = express();
const NODE_ENV = process.env.NODE_ENV || 'development';
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req: Request, _res: Response, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: NODE_ENV,
  });
});

app.use('/api', stockRoutes);

app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Endpoint not found: ${req.method} ${req.path}`,
      timestamp: new Date().toISOString(),
    },
  });
});

app.use((err: any, _req: Request, res: Response, _next: any) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: NODE_ENV === 'development' ? err.message : 'Internal server error',
      timestamp: new Date().toISOString(),
    },
  });
});

export default app;
