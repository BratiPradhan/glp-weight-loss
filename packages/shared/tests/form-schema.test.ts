import { describe, it, expect } from 'vitest';
import Ajv from 'ajv';
import { formSchema } from '../src/schema/form-schema';

const ajv = new Ajv({ allErrors: true });

const screenSchema = {
  type: 'object',
  required: ['id', 'title', 'prompt', 'inputType', 'next'],
  properties: {
    id: { type: 'string' },
    title: { type: 'string' },
    prompt: { type: 'string' },
    inputType: { enum: ['number', 'radio', 'checkbox', 'computed'] },
    next: {
      type: 'object',
      required: ['default'],
    },
  },
};

const validateScreen = ajv.compile(screenSchema);

describe('form schema shape', () => {
  it('has exactly the expected screen IDs', () => {
    const ids = Object.keys(formSchema.screens);
    expect(ids).toHaveLength(15);
    expect(ids).toContain('age');
    expect(ids).toContain('result');
  });

  it('every screen passes structural validation', () => {
    for (const screen of Object.values(formSchema.screens)) {
      const valid = validateScreen(screen);
      if (!valid) {
        console.error(validateScreen.errors);
      }
      expect(valid).toBe(true);
    }
  });

  it('every screen ID in the screens map matches its key', () => {
    for (const [key, screen] of Object.entries(formSchema.screens)) {
      expect(screen.id).toBe(key);
    }
  });

  it('startScreen references an existing screen', () => {
    expect(formSchema.screens[formSchema.startScreen]).toBeDefined();
  });

  it('every screen string-typed `goto` references an existing screen', () => {
    for (const screen of Object.values(formSchema.screens)) {
      const targets = [screen.next.default, ...(screen.next.rules ?? []).map((r) => r.goto)];
      for (const t of targets) {
        if (typeof t === 'string') {
          expect(formSchema.screens[t]).toBeDefined();
        }
      }
    }
  });

  it('radio and checkbox screens have non-empty options', () => {
    for (const screen of Object.values(formSchema.screens)) {
      if (screen.inputType === 'radio' || screen.inputType === 'checkbox') {
        expect(screen.options.length).toBeGreaterThan(0);
      }
    }
  });
});
