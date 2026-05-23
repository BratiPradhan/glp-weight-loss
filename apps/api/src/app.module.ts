import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module.js';
import { SessionModule } from './session/session.module.js';
import { HealthController } from './health/health.controller.js';

@Module({
  imports: [PrismaModule, SessionModule],
  controllers: [HealthController],
})
export class AppModule {}
