import { Inject, Injectable } from '@nestjs/common';
import Redis from 'redis';

@Injectable()
export class AppService {
  constructor(
    @Inject('REDIS_CLIENT') private readonly redis: Redis.RedisClientType,
    @Inject('REDIS_CLIENT2') private readonly redis2: Redis.RedisClientType,
  ) {}

  async getInfo() {
    let result: {
      redisStatus: {
        development: {
          status: string;
          dbsize: number;
        };
        stage: {
          status: string;
          dbsize: number;
        };
      };
    };
    try {
      result = {
        redisStatus: {
          development: {
            status:
              (await this.redis.sendCommand(['PING'])) == 'PONG'
                ? 'active'
                : 'inactive',
            dbsize: await this.redis.sendCommand(['DBSIZE']),
          },
          stage: {
            status:
              (await this.redis2.sendCommand(['PING'])) == 'PONG'
                ? 'active'
                : 'inactive',
            dbsize: await this.redis2.sendCommand(['DBSIZE']),
          },
        },
      };
    } catch (er) {
      console.log(er);
      return {};
    }
    return result;
  }
}
