import { Module } from '@nestjs/common';
import { SessionController } from './session.controller.js';
import { SessionService } from './session.service.js';
import { SessionRepository } from './session.repository.js';

@Module({
  controllers: [SessionController],
  providers: [SessionService, SessionRepository],
})
export class SessionModule {}
