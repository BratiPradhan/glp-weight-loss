import { Injectable } from '@nestjs/common';
import type { Prisma, Session, Answer, SessionStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service.js';

export type SessionWithAnswers = Session & { answers: Answer[] };

@Injectable()
export class SessionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createSession(): Promise<Session> {
    return this.prisma.session.create({
      data: {
        currentScreenId: 'age',
      },
    });
  }

  async getSessionWithAnswers(id: string): Promise<SessionWithAnswers | null> {
    return this.prisma.session.findUnique({
      where: { id },
      include: { answers: true },
    });
  }

  async upsertAnswer(
    sessionId: string,
    screenId: string,
    value: Prisma.InputJsonValue,
  ): Promise<Answer> {
    return this.prisma.answer.upsert({
      where: {
        sessionId_screenId: { sessionId, screenId },
      },
      update: { value },
      create: { sessionId, screenId, value },
    });
  }

  async updateCurrentScreen(
    sessionId: string,
    currentScreenId: string,
  ): Promise<Session> {
    return this.prisma.session.update({
      where: { id: sessionId },
      data: { currentScreenId },
    });
  }

  async completeSession(
    sessionId: string,
    status: SessionStatus,
    result: Prisma.InputJsonValue,
  ): Promise<Session> {
    return this.prisma.session.update({
      where: { id: sessionId },
      data: {
        status,
        result,
        currentScreenId: null,
      },
    });
  }
}
