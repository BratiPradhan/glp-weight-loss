import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { SessionService } from './session.service.js';
import { SessionRepository } from './session.repository.js';

describe('SessionService', () => {
  let service: SessionService;
  let repo: jest.Mocked<SessionRepository>;

  beforeEach(async () => {
    const mockRepo: Partial<jest.Mocked<SessionRepository>> = {
      createSession: jest.fn(),
      getSessionWithAnswers: jest.fn(),
      upsertAnswer: jest.fn(),
      updateCurrentScreen: jest.fn(),
      completeSession: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SessionService,
        { provide: SessionRepository, useValue: mockRepo },
      ],
    }).compile();

    service = module.get(SessionService);
    repo = module.get(SessionRepository);
  });

  describe('start', () => {
    it('creates a new session and returns the first screen', async () => {
      repo.createSession.mockResolvedValue({
        id: 'abc-123',
        status: 'IN_PROGRESS',
        currentScreenId: 'age',
        result: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await service.start();

      expect(result).toEqual({ sessionId: 'abc-123', currentScreenId: 'age' });
      expect(repo.createSession).toHaveBeenCalledTimes(1);
    });
  });

  describe('submitAnswer', () => {
    const sessionId = '11111111-1111-1111-1111-111111111111';

    function mockSession(
      overrides: Partial<{ status: any; answers: any[] }> = {},
    ) {
      return {
        id: sessionId,
        status: 'IN_PROGRESS' as const,
        currentScreenId: 'age',
        result: null,
        answers: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        ...overrides,
      };
    }

    it('returns 404 when session does not exist', async () => {
      repo.getSessionWithAnswers.mockResolvedValue(null);

      await expect(service.submitAnswer(sessionId, 'age', 45)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('rejects answers on completed sessions', async () => {
      repo.getSessionWithAnswers.mockResolvedValue(
        mockSession({ status: 'ELIGIBLE' }),
      );

      await expect(service.submitAnswer(sessionId, 'age', 45)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('rejects invalid answer values', async () => {
      repo.getSessionWithAnswers.mockResolvedValue(mockSession());

      await expect(service.submitAnswer(sessionId, 'age', -5)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('rejects unknown screens', async () => {
      repo.getSessionWithAnswers.mockResolvedValue(mockSession());

      await expect(
        service.submitAnswer(sessionId, 'nonexistent-screen', 1),
      ).rejects.toThrow(BadRequestException);
    });

    it('advances to next screen on valid answer', async () => {
      repo.getSessionWithAnswers.mockResolvedValue(mockSession());
      repo.upsertAnswer.mockResolvedValue({});
      repo.updateCurrentScreen.mockResolvedValue({});

      const result = await service.submitAnswer(sessionId, 'age', 45);

      expect(result).toEqual({ type: 'next', nextScreenId: 'weight' });
      expect(repo.upsertAnswer).toHaveBeenCalledWith(sessionId, 'age', 45);
      expect(repo.updateCurrentScreen).toHaveBeenCalledWith(
        sessionId,
        'weight',
      );
    });

    it('returns terminal ineligible for age < 18', async () => {
      repo.getSessionWithAnswers.mockResolvedValue(mockSession());
      repo.upsertAnswer.mockResolvedValue({});
      repo.completeSession.mockResolvedValue({});

      const result = await service.submitAnswer(sessionId, 'age', 16);

      expect(result.type).toBe('terminal');
      if (result.type === 'terminal') {
        expect(result.result).toEqual({
          status: 'ineligible',
          reason: 'underage',
        });
      }
      expect(repo.completeSession).toHaveBeenCalledWith(
        sessionId,
        'INELIGIBLE',
        expect.anything(),
      );
    });

    it('runs full evaluation after final screen (diet)', async () => {
      // Simulate a session that has answered all prior screens.
      repo.getSessionWithAnswers.mockResolvedValue(
        mockSession({
          answers: [
            { screenId: 'age', value: 45 },
            { screenId: 'weight', value: 90 },
            { screenId: 'height', value: 170 },
            { screenId: 'pregnancy', value: 'No' },
            { screenId: 'comorbidities', value: [] },
            { screenId: 'diabetes', value: 'No' },
            { screenId: 'bloodPressure', value: ['Normal'] },
            { screenId: 'medications', value: [] },
            { screenId: 'smoking', value: 'No' },
            { screenId: 'alcohol', value: 'Never' },
            { screenId: 'activity', value: 'Moderate' },
          ],
        }),
      );
      repo.upsertAnswer.mockResolvedValue({});
      repo.completeSession.mockResolvedValue({});

      const result = await service.submitAnswer(sessionId, 'diet', [
        'Balanced diet',
      ]);

      expect(result.type).toBe('terminal');
      if (result.type === 'terminal') {
        expect(result.result.status).toBe('eligible');
      }
    });

    it('skips computed screens (BMI) and advances to pregnancy', async () => {
      repo.getSessionWithAnswers.mockResolvedValue(
        mockSession({
          currentScreenId: 'height',
          answers: [
            { screenId: 'age', value: 45 },
            { screenId: 'weight', value: 90 },
          ],
        }),
      );
      repo.upsertAnswer.mockResolvedValue({});
      repo.updateCurrentScreen.mockResolvedValue({});

      const result = await service.submitAnswer(sessionId, 'height', 170);

      expect(result).toEqual({ type: 'next', nextScreenId: 'pregnancy' });
    });

    it('terminates on BMI < 25 (computed → ineligible)', async () => {
      repo.getSessionWithAnswers.mockResolvedValue(
        mockSession({
          currentScreenId: 'height',
          answers: [
            { screenId: 'age', value: 45 },
            { screenId: 'weight', value: 60 },
          ],
        }),
      );
      repo.upsertAnswer.mockResolvedValue({});
      repo.completeSession.mockResolvedValue({});

      // 60kg / 175cm → BMI ~19.6 → ineligible bmi-too-low
      const result = await service.submitAnswer(sessionId, 'height', 175);

      expect(result.type).toBe('terminal');
      if (result.type === 'terminal') {
        expect(result.result).toEqual({
          status: 'ineligible',
          reason: 'bmi-too-low',
        });
      }
    });
  });

  describe('getSession', () => {
    it('returns 404 for unknown session', async () => {
      repo.getSessionWithAnswers.mockResolvedValue(null);

      await expect(service.getSession('xxx')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('returns session with answers map', async () => {
      repo.getSessionWithAnswers.mockResolvedValue({
        id: 'abc',
        status: 'IN_PROGRESS',
        currentScreenId: 'weight',
        result: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        answers: [
          {
            id: 'a1',
            sessionId: 'abc',
            screenId: 'age',
            value: 45,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
      });

      const result = await service.getSession('abc');

      expect(result).toMatchObject({
        sessionId: 'abc',
        status: 'in-progress',
        currentScreenId: 'weight',
        answers: { age: 45 },
        result: null,
      });
    });
  });
});
