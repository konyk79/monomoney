import Redis, { createClient } from 'redis';

export class AppService {
  constructor(
    private readonly redis: Redis.RedisClientType = createClient({
      url: process.env.REDIS_OPTIONS_PRODUCTION,
    }),
    private readonly redisStage: Redis.RedisClientType = createClient({
      url: process.env.REDIS_OPTIONS_STAGE,
    }),
    private readonly redisDev: Redis.RedisClientType = createClient({
      url: process.env.REDIS_OPTIONS_DEVELOPMENT,
    }),
  ) {}

  private async fillInRadisAnswer(
    environment: 'production' | 'development' | 'stage',
    redis: Redis.RedisClientType,
  ): Promise<{
    status: string;
    dbsize: number | undefined;
  }> {
    let prod: {
      status: string;
      dbsize: number | undefined;
    };
    try {
      await redis.connect();
      prod = {
        status: 'active',
        dbsize: await redis.sendCommand(['DBSIZE']),
      };
      await redis.disconnect();
    } catch (er) {
      console.log(`Error problem with ${environment} connection`);
      try {
        redis.disconnect();
      } catch (_er) {}
      prod = {
        status: 'inactive',
        dbsize: undefined,
      };
    }
    return prod;
  }

  async getInfo() {
    const result = {
      redisStatus: {
        production: await this.fillInRadisAnswer('production', this.redis),
        stage: await this.fillInRadisAnswer('stage', this.redisStage),
        development: await this.fillInRadisAnswer('development', this.redisDev),
      },
    };

    return result;
  }
}
