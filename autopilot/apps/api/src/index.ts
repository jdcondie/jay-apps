import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { authMiddleware } from './middleware/auth';
import { billingMiddleware } from './middleware/billing';
import pipelineRouter from './routes/pipeline';
import scannerRouter from './routes/scanner';
import intakeRouter from './routes/intake';
import expandRouter from './routes/expand';
import detectSkillsRouter from './routes/detect-skills';
import billingRouter from './routes/billing';

const app = express();

app.use(cors({ origin: process.env.WEB_URL || 'http://localhost:5173' }));
app.use('/api/billing/webhook', express.raw({ type: 'application/json' }));
app.use(express.json());

// Public
app.use('/api/billing', billingRouter);

// Protected
app.use('/api', authMiddleware);
app.use('/api', billingMiddleware);
app.use('/api/pipeline', pipelineRouter);
app.use('/api/scanner', scannerRouter);
app.use('/api/intake', intakeRouter);
app.use('/api/expand', expandRouter);
app.use('/api/detect-skills', detectSkillsRouter);

app.get('/health', (_, res) => res.json({ ok: true }));

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`API running on port ${port}`);
});
