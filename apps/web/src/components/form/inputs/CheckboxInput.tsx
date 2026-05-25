'use client';

import type { Screen } from '@glp1/shared';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

type Props = {
  screen: Extract<Screen, { inputType: 'checkbox' }>;
  value: string[];
  onChange: (v: string[]) => void;
  error?: string;
};

export function CheckboxInput({ screen, value, onChange, error }: Props) {
  const errorId = `checkbox-${screen.id}-error`;

  const toggle = (option: string) => {
    if (value.includes(option)) {
      onChange(value.filter((v) => v !== option));
    } else {
      onChange([...value, option]);
    }
  };

  return (
    <div className="space-y-2">
      <div
        role="group"
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
        data-testid={`input-${screen.id}`}
      >
        {screen.options.map((option) => {
          const id = `${screen.id}-${option.replace(/\s+/g, '-')}`;
          const checked = value.includes(option);
          return (
            <div key={option} className="flex items-center space-x-2 py-1">
              <Checkbox
                id={id}
                checked={checked}
                onCheckedChange={() => toggle(option)}
                data-testid={`option-${screen.id}-${option.replace(/\s+/g, '-')}`}
              />
              <Label htmlFor={id} className="font-normal cursor-pointer">
                {option}
              </Label>
            </div>
          );
        })}
      </div>
      {error && (
        <p id={errorId} role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
