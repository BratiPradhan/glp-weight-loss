import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import {
  formSchema,
  getNextScreen,
  evaluateEligibility,
  getAnswerSchema,
  type Answers,
  type EligibilityResult,
  type ScreenId,
  type AnswerSchemaKey,
} from '@glp1/shared';
import { SessionRepository, SessionWithAnswers } from './session.repository.js';
import type { SessionStatus } from '@prisma/client';

export type StartSessionResult = {
  sessionId: string;
  currentScreenId: ScreenId;
};

export type SubmitAnswerResult =
  | { type: 'next'; nextScreenId: ScreenId }
  | { type: 'terminal'; result: EligibilityResult };

export type GetSessionResult = {
  sessionId: string;
  status: 'in-progress' | 'completed';
  currentScreenId: ScreenId | null;
  answers: Record<string, unknown>;
  result: EligibilityResult | null;
};

@Injectable()
export class SessionService {
  constructor(private readonly repo: SessionRepository) {}

  async start(): Promise<StartSessionResult> {
    const session = await this.repo.createSession();
    return {
      sessionId: session.id,
      currentScreenId: formSchema.startScreen,
    };
  }

  async submitAnswer(
    sessionId: string,
    screenId: string,
    value: unknown,
  ): Promise<SubmitAnswerResult> {
    const session = await this.repo.getSessionWithAnswers(sessionId);
    if (!session) {
      throw new NotFoundException(`Session ${sessionId} not found`);
    }

    if (session.status !== 'IN_PROGRESS') {
      throw new BadRequestException('Session is already complete');
    }

    // Validate the answer against the screen's Zod schema.
    const schema = getAnswerSchema(screenId as AnswerSchemaKey);
    if (!schema) {
      throw new BadRequestException(`Unknown screen: ${screenId}`);
    }

    const parsed = schema.safeParse(value);
    if (!parsed.success) {
      throw new BadRequestException({
        message: 'Invalid answer for screen',
        errors: parsed.error.flatten(),
      });
    }

    // Persist the answer.
    await this.repo.upsertAnswer(sessionId, screenId, parsed.data);

    // Reconstruct the full answers map (existing + the new one).
    const answers = this.buildAnswersMap(session, screenId, parsed.data);

    // Ask the engine where to go next.

    let next = getNextScreen(screenId as ScreenId, answers);

    // Skip past computed screens — the engine resolves them server-side.
    while (next.type === 'next-screen') {
      const targetScreen = formSchema.screens[next.screenId];
      if (targetScreen.inputType !== 'computed') break;
      next = getNextScreen(next.screenId, answers);
    }

    if (next.type === 'next-screen') {
      await this.repo.updateCurrentScreen(sessionId, next.screenId);
      return { type: 'next', nextScreenId: next.screenId };
    }

    // Terminal — figure out the result.
    let result: EligibilityResult;
    let status: SessionStatus;

    if (next.type === 'evaluate') {
      result = evaluateEligibility(answers);
      status = this.mapResultToStatus(result);
    } else if (next.type === 'ineligible') {
      result = { status: 'ineligible', reason: next.reason };
      status = 'INELIGIBLE';
    } else {
      // clinical-review terminal from the engine
      result = { status: 'clinical-review', reasons: [next.reason] };
      status = 'CLINICAL_REVIEW';
    }

    await this.repo.completeSession(sessionId, status, result);

    return { type: 'terminal', result };
  }

  async getSession(id: string): Promise<GetSessionResult> {
    const session = await this.repo.getSessionWithAnswers(id);
    if (!session) {
      throw new NotFoundException(`Session ${id} not found`);
    }

    const answers: Record<string, unknown> = {};
    for (const a of session.answers) {
      answers[a.screenId] = a.value;
    }

    return {
      sessionId: session.id,
      status: session.status === 'IN_PROGRESS' ? 'in-progress' : 'completed',
      currentScreenId: session.currentScreenId as ScreenId | null,
      answers,
      result: session.result as EligibilityResult | null,
    };
  }

  private buildAnswersMap(
    session: SessionWithAnswers,
    newScreenId: string,
    newValue: unknown,
  ): Answers {
    const answers: Record<string, unknown> = {};
    for (const a of session.answers) {
      answers[a.screenId] = a.value;
    }
    answers[newScreenId] = newValue;
    return answers;
  }

  private mapResultToStatus(result: EligibilityResult): SessionStatus {
    switch (result.status) {
      case 'eligible':
        return 'ELIGIBLE';
      case 'ineligible':
        return 'INELIGIBLE';
      case 'clinical-review':
        return 'CLINICAL_REVIEW';

      default: {
        const _exhaustive: never = result;
        throw new Error(
          `Unknown result status: ${JSON.stringify(_exhaustive)}`,
        );
      }
    }
  }
}
