/** Pre-download the mongodb-memory-server binary before integration workers
 * start. Single-shot to avoid a race where parallel downloads collide on the
 * `.downloading -> .zip` rename on Windows. */
module.exports = async function globalSetup() {
  const { MongoBinary } = require('mongodb-memory-server-core');
  const version = '7.0.14';
  // eslint-disable-next-line no-console
  console.log(`[jest:setup] ensuring mongodb-memory-server binary ${version}`);
  await MongoBinary.getPath({ version });
  // eslint-disable-next-line no-console
  console.log('[jest:setup] mongodb-memory-server binary ready');
};
