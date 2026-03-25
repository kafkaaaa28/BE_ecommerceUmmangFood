import 'dotenv/config';
import { app } from './app.js';
import { connectRedis } from './config/redis.config.js';
const PORT: number = 5000;
const startServer = async () => {
  try {
    await connectRedis();
    app.listen(PORT, '0.0.0.0', () => {
      console.log('Server running on port ' + PORT);
    });
  } catch (err) {
    console.error('Failed to connect Redis', err);
    process.exit(1);
  }
};

startServer();
