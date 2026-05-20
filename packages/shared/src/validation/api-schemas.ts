import { z } from 'zod';

// Discriminated union: any answer's shape depends on its screen.
// We don't type-narrow here; the controller does that after looking up the screen.
export const answerValueSchema = z.union([z.number(), z.string(), z.array(z.string())]);

export const startSessionResponseSchema = z.object({
  sessionId: z.string().uuid(),
  currentScreenId: z.string(),
});

export const submitAnswerRequestSchema = z.object({
  sessionId: z.string().uuid(),
  screenId: z.string(),
  value: answerValueSchema,
});

// The /answer endpoint returns either a "next screen" or a "terminal result".
export const submitAnswerResponseSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('next'),
    nextScreenId: z.string(),
  }),
  z.object({
    type: z.literal('terminal'),
    result: z.object({
      status: z.enum(['eligible', 'ineligible', 'clinical-review']),
      reasons: z.array(z.string()).optional(),
      reason: z.string().optional(),
    }),
  }),
]);

export const getSessionResponseSchema = z.object({
  sessionId: z.string().uuid(),
  status: z.enum(['in-progress', 'completed']),
  currentScreenId: z.string().nullable(),
  answers: z.record(z.string(), answerValueSchema),
  result: z
    .object({
      status: z.enum(['eligible', 'ineligible', 'clinical-review']),
      reasons: z.array(z.string()).optional(),
      reason: z.string().optional(),
    })
    .nullable(),
});

// Inferred types — exported for both frontend and backend.
export type StartSessionResponse = z.infer<typeof startSessionResponseSchema>;
export type SubmitAnswerRequest = z.infer<typeof submitAnswerRequestSchema>;
export type SubmitAnswerResponse = z.infer<typeof submitAnswerResponseSchema>;
export type GetSessionResponse = z.infer<typeof getSessionResponseSchema>;
