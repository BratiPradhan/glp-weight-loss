import { describe, it, expect } from 'vitest';
import { getNextScreen } from '../src/engine/get-next-screen';

describe('getNextScreen', () => {
  it('age < 18 → terminal ineligible underage', () => {
    expect(getNextScreen('age', { age: 17 })).toEqual({
      type: 'ineligible',
      reason: 'underage',
    });
  });

  it('age > 75 → terminal clinical review', () => {
    expect(getNextScreen('age', { age: 80 })).toEqual({
      type: 'clinical-review',
      reason: 'age-over-75',
    });
  });

  it('age in range → next screen weight', () => {
    expect(getNextScreen('age', { age: 45 })).toEqual({
      type: 'next-screen',
      screenId: 'weight',
    });
  });

  it('diabetes = Yes → goes to hba1c', () => {
    expect(getNextScreen('diabetes', { age: 45, diabetes: 'Yes' })).toEqual({
      type: 'next-screen',
      screenId: 'hba1c',
    });
  });

  it('diabetes = No → skips hba1c, goes to bloodPressure', () => {
    expect(getNextScreen('diabetes', { age: 45, diabetes: 'No' })).toEqual({
      type: 'next-screen',
      screenId: 'bloodPressure',
    });
  });

  it('GLP-1 in medications → terminal ineligible', () => {
    expect(
      getNextScreen('medications', {
        medications: ['GLP-1 receptor agonist'],
      }),
    ).toEqual({ type: 'ineligible', reason: 'already-on-glp1' });
  });

  it('throws on unknown screen', () => {
    // @ts-expect-error testing runtime guard
    expect(() => getNextScreen('nonexistent', {})).toThrow();
  });
});
