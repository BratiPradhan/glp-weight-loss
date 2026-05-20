import type { Answers } from '../schema/types';
import { computeBmi } from '../engine/bmi';
import type { EligibilityResult, IneligibilityReason, ReviewReason } from './types';

/**
 * Pure function: evaluates all answers against eligibility rules.
 *
 * Order of operations:
 *   1. Immediate ineligibility (any one match → return immediately)
 *   2. Clinical review triggers (collect all matching reasons)
 *   3. Default: eligible
 *
 * Hard rules from spec:
 *   Ineligible: age<18, BMI<25, pregnancy=Yes, HbA1c>9.0, GLP-1 selected
 *   Review:     age>75, BMI≥40, Stage 2 + diabetes, Hypertensive Crisis,
 *               ≥3 comorbidities, plus two combo rules
 */
export function evaluateEligibility(answers: Answers): EligibilityResult {
  const ineligibility = checkIneligibility(answers);
  if (ineligibility) {
    return { status: 'ineligible', reason: ineligibility };
  }

  const reviewReasons = checkClinicalReview(answers);
  if (reviewReasons.length > 0) {
    return { status: 'clinical-review', reasons: reviewReasons };
  }

  return { status: 'eligible' };
}

// ---- Ineligibility ------------------------------------------------------

function checkIneligibility(answers: Answers): IneligibilityReason | null {
  // Age
  if (answers.age !== undefined && answers.age < 18) return 'underage';

  // BMI
  if (answers.weight !== undefined && answers.height !== undefined) {
    const bmi = computeBmi(answers.weight, answers.height);
    if (bmi < 25) return 'bmi-too-low';
  }

  // Pregnancy
  if (answers.pregnancy === 'Yes') return 'pregnancy';

  // HbA1c
  if (answers.hba1c !== undefined && answers.hba1c > 9.0) {
    return 'uncontrolled-diabetes';
  }

  // GLP-1 already prescribed
  if (answers.medications?.includes('GLP-1 receptor agonist')) {
    return 'already-on-glp1';
  }

  return null;
}

// ---- Clinical Review ----------------------------------------------------

function checkClinicalReview(answers: Answers): ReviewReason[] {
  const reasons: ReviewReason[] = [];

  // Age > 75
  if (answers.age !== undefined && answers.age > 75) {
    reasons.push('age-over-75');
  }

  // BMI ≥ 40
  if (answers.weight !== undefined && answers.height !== undefined) {
    const bmi = computeBmi(answers.weight, answers.height);
    if (bmi >= 40) reasons.push('high-bmi');
  }

  // Stage 2 hypertension + diabetes
  // AMBIGUITY: "diabetes present" defined as Screen 7 answer = 'Yes'.
  // The spec lists this rule but never defines "diabetes present." We chose
  // the user's self-reported diagnosis (Screen 7) over HbA1c-derived diabetes
  // because Screen 7 is the canonical "do you have diabetes" question.
  if (answers.bloodPressure?.includes('Stage 2 Hypertension') && answers.diabetes === 'Yes') {
    reasons.push('stage-2-and-diabetes');
  }

  // Hypertensive Crisis
  if (answers.bloodPressure?.includes('Hypertensive Crisis')) {
    reasons.push('hypertensive-crisis');
  }

  // ≥3 comorbidities
  // AMBIGUITY: Screen 6 selections only. The spec's "comorbid conditions" is
  // explicit on Screen 6, separate from Screen 7 diabetes and Screen 9 BP.
  // We do NOT count diabetes or hypertension toward the count.
  if ((answers.comorbidities?.length ?? 0) >= 3) {
    reasons.push('multiple-comorbidities');
  }

  // Stage 1 HTN + Sedentary + High sugar diet
  if (
    answers.bloodPressure?.includes('Stage 1 Hypertension') &&
    answers.activity === 'Sedentary' &&
    answers.diet?.includes('High sugar intake')
  ) {
    reasons.push('stage-1-sedentary-high-sugar');
  }

  // Daily alcohol + moderate/high risk factors
  // AMBIGUITY: "moderate/high risk factors" is undefined in spec.
  // We define it as ≥2 of: smoker, sedentary, high-sugar diet, BMI ≥35.
  // Documented in WRITEUP.
  if (answers.alcohol === 'Daily' && countRiskFactors(answers) >= 2) {
    reasons.push('daily-alcohol-plus-risk');
  }

  return reasons;
}

function countRiskFactors(answers: Answers): number {
  let count = 0;
  if (answers.smoking === 'Yes') count++;
  if (answers.activity === 'Sedentary') count++;
  if (answers.diet?.includes('High sugar intake')) count++;
  if (
    answers.weight !== undefined &&
    answers.height !== undefined &&
    computeBmi(answers.weight, answers.height) >= 35
  ) {
    count++;
  }
  return count;
}
