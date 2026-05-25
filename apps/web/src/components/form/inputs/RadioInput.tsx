'use client';

import type { Screen } from '@glp1/shared';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

type Props = {
  screen: Extract<Screen, { inputType: 'radio' }>;
  value: string;
  onChange: (v: string) => void;
  error?: string;
};

export function RadioInput({ screen, value, onChange, error }: Props) {
  const errorId = `radio-${screen.id}-error`;

  return (
    <div className="space-y-2">
      <RadioGroup
        value={value}
        onValueChange={onChange}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
        data-testid={`input-${screen.id}`}
      >
        {screen.options.map((option) => {
          const id = `${screen.id}-${option.replace(/\s+/g, '-')}`;
          return (
            <div key={option} className="flex items-center space-x-2">
              <RadioGroupItem
                value={option}
                id={id}
                data-testid={`option-${screen.id}-${option.replace(/\s+/g, '-')}`}
              />
              <Label htmlFor={id} className="font-normal cursor-pointer">
                {option}
              </Label>
            </div>
          );
        })}
      </RadioGroup>
      {error && (
        <p id={errorId} role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
