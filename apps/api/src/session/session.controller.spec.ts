import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { SessionController } from './session.controller.js';
import { SessionService } from './session.service.js';

describe('SessionController', () => {
  let controller: SessionController;
  let service: jest.Mocked<SessionService>;

  beforeEach(async () => {
    const mockService: Partial<jest.Mocked<SessionService>> = {
      start: jest.fn(),
      submitAnswer: jest.fn(),
      getSession: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [SessionController],
      providers: [{ provide: SessionService, useValue: mockService }],
    }).compile();

    controller = module.get(SessionController);
    service = module.get(SessionService);
  });

  it('start delegates to service', async () => {
    service.start.mockResolvedValue({ sessionId: 'x', currentScreenId: 'age' });

    const result = await controller.start({});

    expect(result).toEqual({ sessionId: 'x', currentScreenId: 'age' });
    expect(service.start).toHaveBeenCalled();
  });

  it('submitAnswer delegates to service', async () => {
    service.submitAnswer.mockResolvedValue({
      type: 'next',
      nextScreenId: 'weight',
    });

    const result = await controller.submitAnswer({
      sessionId: '11111111-1111-1111-1111-111111111111',
      screenId: 'age',
      value: 45,
    });

    expect(result).toEqual({ type: 'next', nextScreenId: 'weight' });
  });

  it('getSession delegates to service', async () => {
    service.getSession.mockResolvedValue({
      sessionId: 'x',
      status: 'in-progress',
      currentScreenId: 'age',
      answers: {},
      result: null,
    });

    const result = await controller.getSession('x');
    expect(result.sessionId).toBe('x');
  });
});
