import type { ScreenId, InputType } from './types';

// Branch rules: each rule is a predicate over the answers map.
// We model the rule as data (operator + operands) rather than a function
// so we can serialize the schema to JSON for the validation test.
export type Comparison = 'lt' | 'lte' | 'eq' | 'gte' | 'gt' | 'includes';

export type BranchCondition = {
  field: ScreenId | 'bmi'; // 'bmi' is computed, not a screen answer
  op: Comparison;
  value: number | string;
};

// A rule fires if all of its conditions match.
export type BranchRule = {
  when: BranchCondition[];
  goto: ScreenId | TerminalState;
};

// Terminal states the engine can return without going to another screen.
export type TerminalState =
  | { type: 'ineligible'; reason: IneligibilityReason }
  | { type: 'clinical-review'; reason: ReviewReason }
  | { type: 'evaluate' }; // means "all screens done, run evaluator"

export type IneligibilityReason =
  | 'underage'
  | 'bmi-too-low'
  | 'pregnancy'
  | 'uncontrolled-diabetes'
  | 'already-on-glp1';

export type ReviewReason =
  | 'age-over-75'
  | 'high-bmi'
  | 'stage-2-and-diabetes'
  | 'hypertensive-crisis'
  | 'multiple-comorbidities'
  | 'stage-1-sedentary-high-sugar'
  | 'daily-alcohol-plus-risk'
  | 'already-on-therapy';

// Discriminated union for screen definitions.
// Each variant carries only fields that make sense for its input type.
type BaseScreen = {
  id: ScreenId;
  title: string;
  prompt: string;
  // Either a direct next screen, or a list of branch rules tried in order.
  // First matching rule wins; if none match, fall through to `default`.
  next: { default: ScreenId | TerminalState; rules?: BranchRule[] };
};

export type NumberScreen = BaseScreen & {
  inputType: 'number';
  min?: number;
  max?: number;
  unit?: string;
};

export type RadioScreen = BaseScreen & {
  inputType: 'radio';
  options: readonly string[];
};

export type CheckboxScreen = BaseScreen & {
  inputType: 'checkbox';
  options: readonly string[];
};

export type ComputedScreen = BaseScreen & {
  inputType: 'computed';
  // The frontend skips rendering computed screens; the engine just
  // evaluates rules and moves on.
};

export type Screen = NumberScreen | RadioScreen | CheckboxScreen | ComputedScreen;

export type FormSchema = {
  screens: Record<ScreenId, Screen>;
  startScreen: ScreenId;
};

export type { InputType, ScreenId };
