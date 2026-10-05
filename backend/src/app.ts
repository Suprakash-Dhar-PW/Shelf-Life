import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { logger } from './middleware/logger.js';
import { errorHandler } from './middleware/errorHandler.js';
import { bookRoutes } from './routes/bookRoutes.js';
import { memberRoutes } from './routes/memberRoutes.js';
import { authRoutes } from './routes/authRoutes.js';
import { borrowRoutes } from './routes/borrowRoutes.js';

const app = express();

// Security and basic config
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logger
app.use(logger);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'ShelfLife API is running',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/members', memberRoutes);
app.use('/api', borrowRoutes);

// Centralized error handler should be registered after all routes
app.use(errorHandler);

export { app };
