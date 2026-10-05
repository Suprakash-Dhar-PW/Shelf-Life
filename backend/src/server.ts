import { app } from './app.js';
import { connectDB } from './config/db.js';
import { env } from './config/env.js';
import http from 'http';

const startServer = async () => {
  try {
    try {
      await connectDB();
    } catch (dbError) {
      console.error('❌ Failed to connect to MongoDB. Exiting gracefully...');
      process.exit(1);
    }
    
    const server = http.createServer(app);
    const PORT = parseInt(env.PORT, 10);

    server.listen(PORT, () => {
      console.log(`🚀 Server is running on http://localhost:${PORT}`);
    });

    // Graceful shutdown handling
    const shutdown = () => {
      console.log('Shutting down gracefully...');
      server.close(() => {
        console.log('Closed out remaining connections.');
        process.exit(0);
      });

      // Force close after 10s
      setTimeout(() => {
        console.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
