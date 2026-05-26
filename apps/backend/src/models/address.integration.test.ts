import { Types } from 'mongoose';

import { Address } from './address.model';

import { clearCollections, startInMemoryMongo, stopInMemoryMongo } from '../test-utils/mongo-memory';

describe('Address model (integration)', () => {
  beforeAll(async () => {
    await startInMemoryMongo();
  });

  afterAll(async () => {
    await stopInMemoryMongo();
  });

  afterEach(async () => {
    await clearCollections();
  });

  it('ensures only one default address per user', async () => {
    const userId = new Types.ObjectId();

    const addrA = await Address.create({
      userId,
      kind: 'shipping',
      firstName: 'A',
      lastName: 'User',
      phone: '+15551234567',
      line1: '1 First St',
      city: 'Anywhere',
      postalCode: '00001',
      country: 'United States',
      countryCode: 'US',
      isDefault: true,
    });

    const addrB = await Address.create({
      userId,
      kind: 'shipping',
      firstName: 'B',
      lastName: 'User',
      phone: '+15557654321',
      line1: '2 Second St',
      city: 'Elsewhere',
      postalCode: '00002',
      country: 'United States',
      countryCode: 'US',
      isDefault: true,
    });

    const refreshedA = await Address.findById(addrA._id);
    const refreshedB = await Address.findById(addrB._id);

    expect(refreshedA?.isDefault).toBe(false);
    expect(refreshedB?.isDefault).toBe(true);
  });
});
