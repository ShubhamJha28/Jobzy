import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import apiRouter from './routes/api';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// CORS
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
app.use(
  cors({
    origin: [clientUrl, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
  })
);

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static file serving for uploads
const uploadsDir = path.join(process.cwd(), '..', 'uploads');
app.use('/uploads', express.static(uploadsDir));

// Health check endpoints
app.get('/', (_req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'JOBZY Backend' });
});

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'JOBZY Backend' });
});

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'JOBZY API Engine',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// Mount Master REST API
app.use('/api', apiRouter);

// Global Error Handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled Server Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'An unexpected error occurred on the server.',
  });
});

const server = app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`=================================================`);
  console.log(`🚀 JOBZY Backend API Server running on port ${PORT}`);
  console.log(`🔗 Health check: http://0.0.0.0:${PORT}/api/health`);
  console.log(`=================================================`);
});

// Graceful shutdown handling for Docker / Cloud platforms
const handleShutdown = (signal: string) => {
  console.log(`${signal} signal received: closing HTTP server...`);
  server.close(() => {
    console.log('HTTP server closed successfully.');
    process.exit(0);
  });
};

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));

export default app;
