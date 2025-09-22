import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import usersRouter from './routes/users';
import tweetsRouter from './routes/tweets';
import { isHealthy as dbHealthy } from './db/sqlite';
import path from 'path';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ name: 'kvitter', status: 'ok' });
});

app.get('/health/db', (_req, res) => {
  res.json({ db: dbHealthy() ? 'ok' : 'error' });
});

app.get('/version', (_req, res) => {
  res.json({ version: process.env.APP_VERSION || '0.1.1' });
});

app.use('/api/users', usersRouter);
app.use('/api/tweets', tweetsRouter);

// Basic error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Serve static client in production
const clientDist = path.resolve(process.cwd(), 'client', 'dist');
app.use(express.static(clientDist));

// SPA fallback to index.html
app.get('*', (_req, res) => {
  res.sendFile(path.join(clientDist, 'index.html'));
});

export default app;
