import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

let server: MongoMemoryServer | null = null;

/** Start an in-memory MongoDB server and connect Mongoose to it. */
export async function startInMemoryMongo(): Promise<string> {
  if (server) return server.getUri();
  server = await MongoMemoryServer.create({
    instance: { dbName: 'twinspire-test' },
    binary: { version: '7.0.14' },
  });
  const uri = server.getUri();
  await mongoose.connect(uri, { autoIndex: true, autoCreate: true });
  return uri;
}

/** Disconnect Mongoose and stop the in-memory server. */
export async function stopInMemoryMongo(): Promise<void> {
  await mongoose.disconnect();
  if (server) {
    await server.stop();
    server = null;
  }
}

/** Wipe every collection between tests without dropping the database. */
export async function clearCollections(): Promise<void> {
  const collections = mongoose.connection.collections;
  await Promise.all(
    Object.values(collections).map(async (c) => {
      try {
        await c.deleteMany({});
      } catch {
        // Ignore — collection might not exist yet.
      }
    }),
  );
}
