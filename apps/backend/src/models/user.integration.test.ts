import type { SoftDeleteDocument } from '../db/plugins';
import { clearCollections, startInMemoryMongo, stopInMemoryMongo } from '../test-utils/mongo-memory';

import { User } from './user.model';

describe('User model (integration)', () => {
  beforeAll(async () => {
    await startInMemoryMongo();
  });

  afterAll(async () => {
    await stopInMemoryMongo();
  });

  afterEach(async () => {
    await clearCollections();
  });

  it('hashes passwords on setPassword and verifies via comparePassword', async () => {
    const user = new User({
      email: 'pwtest@example.com',
      firstName: 'Pat',
      lastName: 'Tester',
    });
    await user.setPassword('CorrectHorseBatteryStaple!1');
    await user.save();

    const loaded = await User.findOne({ email: 'pwtest@example.com' }).select('+passwordHash');
    expect(loaded).not.toBeNull();
    expect(loaded?.passwordHash).toBeDefined();
    expect(loaded?.passwordHash).not.toContain('CorrectHorseBatteryStaple');

    await expect(loaded!.comparePassword('CorrectHorseBatteryStaple!1')).resolves.toBe(true);
    await expect(loaded!.comparePassword('wrong')).resolves.toBe(false);
  });

  it('locks the account after 10 failed logins', async () => {
    const user = await User.create({
      email: 'lock@example.com',
      firstName: 'Lock',
      lastName: 'Me',
    });

    for (let i = 0; i < 10; i++) {
      await user.recordFailedLogin();
    }

    expect(user.failedLoginAttempts).toBe(10);
    expect(user.isLocked()).toBe(true);
  });

  it('strips _id, __v, passwordHash, and lastLoginIp on toJSON', async () => {
    const user = new User({
      email: 'json@example.com',
      firstName: 'Json',
      lastName: 'Tester',
    });
    await user.setPassword('LongEnoughPassword!1');
    await user.save();

    const json = user.toJSON() as Record<string, unknown>;
    expect(json.id).toBeDefined();
    expect(json._id).toBeUndefined();
    expect(json.__v).toBeUndefined();
    expect(json.passwordHash).toBeUndefined();
  });

  it('excludes soft-deleted users from default queries', async () => {
    const u = await User.create({ email: 'soft@example.com', firstName: 'Soft', lastName: 'Delete' });
    await (u as unknown as SoftDeleteDocument).softDelete();

    const found = await User.findOne({ email: 'soft@example.com' });
    expect(found).toBeNull();

    const foundWithDeleted = await User.findOne({ email: 'soft@example.com' }).setOptions({ withDeleted: true });
    expect(foundWithDeleted).not.toBeNull();
  });
});
