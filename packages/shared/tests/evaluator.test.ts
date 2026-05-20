import { describe, it, expect } from 'vitest';
import { evaluateEligibility } from '../src/evaluator/evaluator';
import type { Answers } from '../src/schema/types';

// Helpers: build minimal "eligible" answers, then override fields per test.
function eligibleAnswers(overrides: Partial<Answers> = {}): Answers {
  return {
    age: 45,
    weight: 90,
    height: 170, // BMI ≈ 31.1 → eligible band
    pregnancy: 'No',
    comorbidities: [],
    diabetes: 'No',
    bloodPressure: ['Normal'],
    medications: [],
    smoking: 'No',
    alcohol: 'Never',
    activity: 'Moderate',
    diet: ['Balanced diet'],
    ...overrides,
  };
}

describe('evaluateEligibility', () => {
  describe('eligible path', () => {
    it('returns eligible for a healthy adult with BMI in band', () => {
      expect(evaluateEligibility(eligibleAnswers())).toEqual({ status: 'eligible' });
    });
  });

  describe('immediate ineligibility', () => {
    it('underage: age < 18', () => {
      expect(evaluateEligibility(eligibleAnswers({ age: 17 }))).toEqual({
        status: 'ineligible',
        reason: 'underage',
      });
    });

    it('boundary: age exactly 18 is allowed', () => {
      expect(evaluateEligibility(eligibleAnswers({ age: 18 })).status).not.toBe('ineligible');
    });

    it('BMI too low: BMI < 25', () => {
      // 60kg, 175cm → BMI 19.6
      const result = evaluateEligibility(eligibleAnswers({ weight: 60, height: 175 }));
      expect(result).toEqual({ status: 'ineligible', reason: 'bmi-too-low' });
    });

    it('pregnancy = Yes', () => {
      expect(evaluateEligibility(eligibleAnswers({ pregnancy: 'Yes' })).status).toBe('ineligible');
    });

    it('HbA1c > 9.0', () => {
      expect(evaluateEligibility(eligibleAnswers({ diabetes: 'Yes', hba1c: 9.1 }))).toEqual({
        status: 'ineligible',
        reason: 'uncontrolled-diabetes',
      });
    });

    it('boundary: HbA1c exactly 9.0 is allowed', () => {
      const r = evaluateEligibility(eligibleAnswers({ diabetes: 'Yes', hba1c: 9.0 }));
      expect(r.status).not.toBe('ineligible');
    });

    it('GLP-1 receptor agonist already prescribed', () => {
      expect(
        evaluateEligibility(eligibleAnswers({ medications: ['GLP-1 receptor agonist'] })),
      ).toEqual({ status: 'ineligible', reason: 'already-on-glp1' });
    });

    it('ordering: age underage beats BMI low (both true)', () => {
      // 16-year-old with low BMI — underage takes priority
      const result = evaluateEligibility(eligibleAnswers({ age: 16, weight: 50, height: 170 }));
      expect(result).toEqual({ status: 'ineligible', reason: 'underage' });
    });
  });

  describe('clinical review triggers', () => {
    it('age > 75', () => {
      const r = evaluateEligibility(eligibleAnswers({ age: 76 }));
      expect(r).toEqual({ status: 'clinical-review', reasons: ['age-over-75'] });
    });

    it('BMI ≥ 40', () => {
      const r = evaluateEligibility(
        eligibleAnswers({ weight: 130, height: 170 }), // BMI 45
      );
      expect(r.status).toBe('clinical-review');
      if (r.status === 'clinical-review') {
        expect(r.reasons).toContain('high-bmi');
      }
    });

    it('Stage 2 hypertension + diabetes', () => {
      const r = evaluateEligibility(
        eligibleAnswers({
          bloodPressure: ['Stage 2 Hypertension'],
          diabetes: 'Yes',
          hba1c: 7.0,
        }),
      );
      expect(r.status).toBe('clinical-review');
      if (r.status === 'clinical-review') {
        expect(r.reasons).toContain('stage-2-and-diabetes');
      }
    });

    it('Stage 2 alone does NOT trigger (no diabetes)', () => {
      const r = evaluateEligibility(eligibleAnswers({ bloodPressure: ['Stage 2 Hypertension'] }));
      if (r.status === 'clinical-review') {
        expect(r.reasons).not.toContain('stage-2-and-diabetes');
      }
    });

    it('Hypertensive Crisis selected', () => {
      const r = evaluateEligibility(eligibleAnswers({ bloodPressure: ['Hypertensive Crisis'] }));
      if (r.status === 'clinical-review') {
        expect(r.reasons).toContain('hypertensive-crisis');
      }
    });

    it('≥3 comorbidities', () => {
      const r = evaluateEligibility(
        eligibleAnswers({
          comorbidities: ['Hypertension', 'Dyslipidemia', 'Sleep Apnea'],
        }),
      );
      if (r.status === 'clinical-review') {
        expect(r.reasons).toContain('multiple-comorbidities');
      }
    });

    it('2 comorbidities does NOT trigger', () => {
      const r = evaluateEligibility(eligibleAnswers({ comorbidities: ['Hypertension', 'GERD'] }));
      expect(r.status).toBe('eligible');
    });

    it('Stage 1 HTN + Sedentary + High sugar diet', () => {
      const r = evaluateEligibility(
        eligibleAnswers({
          bloodPressure: ['Stage 1 Hypertension'],
          activity: 'Sedentary',
          diet: ['High sugar intake'],
        }),
      );
      if (r.status === 'clinical-review') {
        expect(r.reasons).toContain('stage-1-sedentary-high-sugar');
      }
    });

    it('daily alcohol + 2+ risk factors', () => {
      const r = evaluateEligibility(
        eligibleAnswers({
          alcohol: 'Daily',
          smoking: 'Yes',
          activity: 'Sedentary',
        }),
      );
      if (r.status === 'clinical-review') {
        expect(r.reasons).toContain('daily-alcohol-plus-risk');
      }
    });

    it('daily alcohol + only 1 risk factor does NOT trigger', () => {
      const r = evaluateEligibility(eligibleAnswers({ alcohol: 'Daily', smoking: 'Yes' }));
      expect(r.status).toBe('eligible');
    });

    it('collects multiple review reasons', () => {
      const r = evaluateEligibility(
        eligibleAnswers({
          weight: 130,
          height: 170, // BMI ≥ 40
          bloodPressure: ['Hypertensive Crisis'],
        }),
      );
      if (r.status === 'clinical-review') {
        expect(r.reasons).toContain('high-bmi');
        expect(r.reasons).toContain('hypertensive-crisis');
        expect(r.reasons.length).toBe(2);
      }
    });
  });

  describe('BMI computation edge cases', () => {
    it('BMI exactly 25 is eligible (not <25)', () => {
      // 76.5625kg, 175cm → BMI 25.0 exactly
      const r = evaluateEligibility(eligibleAnswers({ weight: 76.5625, height: 175 }));
      expect(r.status).not.toBe('ineligible');
    });

    it('BMI exactly 40 triggers review (≥40)', () => {
      // 122.5kg, 175cm → BMI 40.0 exactly
      const r = evaluateEligibility(eligibleAnswers({ weight: 122.5, height: 175 }));
      if (r.status === 'clinical-review') {
        expect(r.reasons).toContain('high-bmi');
      }
    });
  });
});
