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
    [key: string]: {
      status: string;
      dbsize: number | undefined;
    };
  }> {
    let prod: {
      [key: string]: {
        status: string;
        dbsize: number | undefined;
      };
    };
    try {
      await redis.connect();
      prod = {
        [environment]: {
          status: 'active',
          dbsize: await redis.sendCommand(['DBSIZE']),
        },
      };
      await redis.disconnect();
    } catch (er) {
      console.log(`Error problem with ${environment} connection`);
      try {
        redis.disconnect();
      } catch (_er) {}
      prod = {
        [environment]: {
          status: 'inactive',
          dbsize: undefined,
        },
      };
    }
    return prod;
  }

  async getInfo() {
    const result = {
      redisStatus: {
        production: await this.fillInRadisAnswer('production', this.redis),
        stage: await this.fillInRadisAnswer('stage', this.redisStage),
        development: await this.fillInRadisAnswer('stage', this.redisDev),
      },
    };

    return result;
  }
}
