import { z } from 'zod';

export const answerValueSchema = z.union([z.number(), z.string(), z.array(z.string())]);

const ineligibilityReasonSchema = z.enum([
  'underage',
  'bmi-too-low',
  'pregnancy',
  'uncontrolled-diabetes',
  'already-on-glp1',
]);

const reviewReasonSchema = z.enum([
  'age-over-75',
  'high-bmi',
  'stage-2-and-diabetes',
  'hypertensive-crisis',
  'multiple-comorbidities',
  'stage-1-sedentary-high-sugar',
  'daily-alcohol-plus-risk',
  'already-on-therapy',
]);

export const eligibilityResultSchema = z.discriminatedUnion('status', [
  z.object({ status: z.literal('eligible') }),
  z.object({
    status: z.literal('ineligible'),
    reason: ineligibilityReasonSchema,
  }),
  z.object({
    status: z.literal('clinical-review'),
    reasons: z.array(reviewReasonSchema),
  }),
]);

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
    result: eligibilityResultSchema,
  }),
]);

export const getSessionResponseSchema = z.object({
  sessionId: z.string().uuid(),
  status: z.enum(['in-progress', 'completed']),
  currentScreenId: z.string().nullable(),
  answers: z.record(z.string(), answerValueSchema),
  result: eligibilityResultSchema.nullable(),
});

export type StartSessionResponse = z.infer<typeof startSessionResponseSchema>;
export type SubmitAnswerRequest = z.infer<typeof submitAnswerRequestSchema>;
export type SubmitAnswerResponse = z.infer<typeof submitAnswerResponseSchema>;
export type GetSessionResponse = z.infer<typeof getSessionResponseSchema>;
export type EligibilityResultDto = z.infer<typeof eligibilityResultSchema>;
