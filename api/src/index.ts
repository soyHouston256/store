import { config } from './config.js';
import { connectDb } from './db.js';
import { createApp } from './app.js';

async function main(): Promise<void> {
  await connectDb(config.mongoUri);
  const app = createApp();
  app.listen(config.port, () => {
    console.log(`API listening on :${config.port}`);
  });
}

main().catch((err) => {
  console.error('Fatal startup error:', err);
  process.exit(1);
});
