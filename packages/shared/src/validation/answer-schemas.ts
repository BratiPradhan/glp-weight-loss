import { z } from 'zod';

// One schema per screen that takes user input.
// Computed screens (bmi, result) have no answer schema — they're not user-entered.
export const answerSchemas = {
  age: z.coerce.number().int().min(0).max(120),

  weight: z.coerce.number().positive().max(500),

  height: z.coerce.number().positive().min(50).max(250),

  pregnancy: z.enum(['Yes', 'No']),

  comorbidities: z.array(
    z.enum(['Hypertension', 'Dyslipidemia', 'Sleep Apnea', 'GERD', 'Thyroid Disorder']),
  ),
  // Note: min(1) NOT enforced — "no comorbidities" is a valid answer.
  // The checkbox UI must allow submission with zero selections.

  diabetes: z.enum(['Yes', 'No']),

  hba1c: z.coerce.number().min(2).max(20),
  // HbA1c physiologically ranges roughly 4–15%. Bounds 2–20 are a sanity check.

  bloodPressure: z
    .array(
      z.enum([
        'Normal',
        'Elevated',
        'Stage 1 Hypertension',
        'Stage 2 Hypertension',
        'Hypertensive Crisis',
      ]),
    )
    .min(1),
  // BP requires at least one selection — there's no "no BP" answer.

  medications: z.array(
    z.enum([
      'ACE inhibitors',
      'Beta blockers',
      'Statins',
      'Thyroid medication',
      'GLP-1 receptor agonist',
    ]),
  ),
  // Empty array allowed: user takes no medications.

  smoking: z.enum(['Yes', 'No']),

  alcohol: z.enum(['Never', 'Monthly', 'Weekly', 'Daily']),

  activity: z.enum(['Sedentary', 'Light', 'Moderate', 'Vigorous']),

  diet: z
    .array(
      z.enum([
        'High sugar intake',
        'High processed foods',
        'Frequent sugary beverages',
        'High fiber diet',
        'Balanced diet',
      ]),
    )
    .min(1),
} as const;

// Type-safe lookup: getSchema('age') returns ZodNumber, etc.
export type AnswerSchemas = typeof answerSchemas;
export type AnswerSchemaKey = keyof AnswerSchemas;

export function getAnswerSchema(screenId: AnswerSchemaKey) {
  return answerSchemas[screenId];
}
