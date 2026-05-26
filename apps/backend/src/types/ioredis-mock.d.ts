declare module 'ioredis-mock' {
  import type Redis from 'ioredis';

  type RedisCtorArgs = ConstructorParameters<typeof Redis>;

  /**
   * Minimal typing surface for ioredis-mock — sufficient for tests that swap
   * the singleton client. The mock is API-compatible with ioredis.
   */
  class RedisMock extends Redis {
    constructor(...args: RedisCtorArgs);
  }

  export = RedisMock;
}
