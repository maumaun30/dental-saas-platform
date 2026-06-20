import { createApp } from './app.js';
import { initDb } from './db.js';
import { config } from './config.js';

async function main() {
  await initDb();
  const app = createApp();
  app.listen(config.port, () => {
    console.log(`[dental-saas] API listening on http://localhost:${config.port}`);
    if (config.seedDemoUser) {
      console.log(`[dental-saas] Demo login: ${config.demoUser.email} / ${config.demoUser.password}`);
    }
  });
}

main().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
