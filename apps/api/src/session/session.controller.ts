import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  UsePipes,
} from '@nestjs/common';
import {
  submitAnswerRequestSchema,
  type SubmitAnswerRequest,
} from '@glp1/shared';
import { z } from 'zod';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe.js';
import { SessionService } from './session.service.js';

const startSessionBodySchema = z.object({}).strict();

@Controller('session')
export class SessionController {
  constructor(private readonly service: SessionService) {}

  @Post('start')
  @UsePipes(new ZodValidationPipe(startSessionBodySchema))
  async start(@Body() _body: unknown) {
    const result = await this.service.start();
    return {
      sessionId: result.sessionId,
      currentScreenId: result.currentScreenId,
    };
  }

  @Post('answer')
  async submitAnswer(
    @Body(new ZodValidationPipe(submitAnswerRequestSchema))
    dto: SubmitAnswerRequest,
  ) {
    return this.service.submitAnswer(dto.sessionId, dto.screenId, dto.value);
  }

  @Get(':id')
  async getSession(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.service.getSession(id);
  }
}
