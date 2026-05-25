'use client';

import type { UseFormRegister } from 'react-hook-form';
import type { Screen } from '@glp1/shared';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Props = {
  screen: Extract<Screen, { inputType: 'number' }>;
  register: UseFormRegister<{ value: number | string | string[] }>;
  error?: string;
};

export function NumberInput({ screen, register, error }: Props) {
  const id = `input-${screen.id}`;
  const errorId = `${id}-error`;

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {screen.title}
        {screen.unit && <span className="ml-1 text-muted-foreground">({screen.unit})</span>}
      </Label>
      <Input
        id={id}
        type="number"
        inputMode="decimal"
        min={screen.min}
        max={screen.max}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
        data-testid={`input-${screen.id}`}
        {...register('value', { valueAsNumber: true })}
      />
      {error && (
        <p id={errorId} role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
