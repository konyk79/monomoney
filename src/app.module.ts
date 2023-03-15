import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { createClient } from 'redis';
// import { createClient } from 'redis';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: 'REDIS_OPTIONS',
      useValue: {
        url: 'redis://localhost:6379',
        retryAttempts: 5,
        retryDelay: 5000,
      },
    },
    {
      provide: 'REDIS_OPTIONS2',
      useValue: {
        url: 'redis://localhost:6380',
        retryAttempts: 5,
        retryDelay: 5000,
      },
    },
    {
      inject: ['REDIS_OPTIONS'],
      provide: 'REDIS_CLIENT',
      useFactory: async (options: { url: string }) => {
        const client = createClient(options);
        await client.connect();
        return client;
      },
    },
    {
      inject: ['REDIS_OPTIONS2'],
      provide: 'REDIS_CLIENT2',
      useFactory: async (options: { url: string }) => {
        const client = createClient(options);
        await client.connect();
        return client;
      },
    },
  ],
})
export class AppModule {}
