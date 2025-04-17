import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Activity } from './common/entities/activity.entity';
import { User } from './common/entities/user.entity';
import { StravaModule } from './modules/strava/strava.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT,
      username: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      entities: [Activity, User],
      synchronize: true,
    }),
    StravaModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
