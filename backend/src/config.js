import 'dotenv/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const config = {
  port: Number(process.env.PORT) || 4000,
  jwtSecret: process.env.JWT_SECRET || 'dev-only-insecure-secret-change-me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  corsOrigin: process.env.CORS_ORIGIN || '*',
  dbFile: process.env.DB_FILE || path.join(__dirname, '..', 'data', 'db.json'),
  seedDemoUser: process.env.SEED_DEMO_USER !== 'false',
  demoUser: {
    email: process.env.DEMO_EMAIL || 'dentist@demo.com',
    password: process.env.DEMO_PASSWORD || 'demo1234',
    name: process.env.DEMO_NAME || 'Dr. Demo',
    practiceName: process.env.DEMO_PRACTICE || 'Practice Dental',
  },
};

if (config.jwtSecret === 'dev-only-insecure-secret-change-me' && process.env.NODE_ENV === 'production') {
  throw new Error('JWT_SECRET must be set in production.');
}
