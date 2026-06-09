import 'dotenv/config';
import { app } from './app.js';
import { connectRedis } from './config/redis.config.js';

const PORT: number = 5000;

const startServer = async () => {
  try {
    await connectRedis();

    app.listen(PORT, '127.0.0.1', () => {
      console.log('Server running on http://127.0.0.1:' + PORT);
    });
  } catch (err) {
    console.error('Failed to connect Redis', err);
    process.exit(1);
  }
};

startServer();
