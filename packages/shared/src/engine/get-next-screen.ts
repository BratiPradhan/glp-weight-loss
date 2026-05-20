import type { Answers } from '../schema/types';
import type {
  BranchCondition,
  BranchRule,
  Screen,
  ScreenId,
  TerminalState,
} from '../schema/screen-types';
import { formSchema } from '../schema/form-schema';
import { computeBmi } from './bmi';

export type EngineResult = { type: 'next-screen'; screenId: ScreenId } | TerminalState;

/**
 * Pure function: given the current screen and answers so far,
 * returns the next screen ID or a terminal state.
 *
 * This function is the *single* place branching logic is interpreted.
 * The evaluator handles final eligibility separately.
 */
export function getNextScreen(currentScreenId: ScreenId, answers: Answers): EngineResult {
  const screen = formSchema.screens[currentScreenId];
  if (!screen) {
    throw new Error(`Unknown screen: ${currentScreenId}`);
  }

  // Evaluate branch rules in order; first matching rule wins.
  for (const rule of screen.next.rules ?? []) {
    if (matchesRule(rule, answers)) {
      return resolveGoto(rule.goto);
    }
  }

  // No rule matched — fall through to default.
  return resolveGoto(screen.next.default);
}

function resolveGoto(goto: Screen['next']['default']): EngineResult {
  if (typeof goto === 'string') {
    return { type: 'next-screen', screenId: goto };
  }
  return goto; // already a TerminalState
}

function matchesRule(rule: BranchRule, answers: Answers): boolean {
  return rule.when.every((condition) => matchesCondition(condition, answers));
}

function matchesCondition(condition: BranchCondition, answers: Answers): boolean {
  const actual = getFieldValue(condition.field, answers);
  if (actual === undefined) return false;

  switch (condition.op) {
    case 'lt':
      return typeof actual === 'number' && actual < (condition.value as number);
    case 'lte':
      return typeof actual === 'number' && actual <= (condition.value as number);
    case 'eq':
      return actual === condition.value;
    case 'gte':
      return typeof actual === 'number' && actual >= (condition.value as number);
    case 'gt':
      return typeof actual === 'number' && actual > (condition.value as number);
    case 'includes':
      return Array.isArray(actual) && actual.includes(condition.value as string);
  }
}

function getFieldValue(
  field: BranchCondition['field'],
  answers: Answers,
): number | string | string[] | undefined {
  if (field === 'bmi') {
    if (answers.weight === undefined || answers.height === undefined) return undefined;
    return computeBmi(answers.weight, answers.height);
  }
  return answers[field as keyof Answers] as number | string | string[] | undefined;
}
