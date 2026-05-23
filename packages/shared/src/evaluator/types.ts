import type { IneligibilityReason, ReviewReason } from '../schema/screen-types.js';

export type EligibilityResult =
  | { status: 'eligible' }
  | { status: 'ineligible'; reason: IneligibilityReason }
  | { status: 'clinical-review'; reasons: ReviewReason[] };

export type { IneligibilityReason, ReviewReason };
