import type { IneligibilityReason, ReviewReason } from '../schema/screen-types';

export type EligibilityResult =
  | { status: 'eligible' }
  | { status: 'ineligible'; reason: IneligibilityReason }
  | { status: 'clinical-review'; reasons: ReviewReason[] };

export type { IneligibilityReason, ReviewReason };
