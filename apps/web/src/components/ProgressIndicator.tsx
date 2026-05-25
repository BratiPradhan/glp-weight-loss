'use client';

import { formSchema } from '@glp1/shared';
import { Progress } from '@/components/ui/progress';
import { useSessionStore } from '@/store/session-store';

// Order of input screens shown to the user (computed screens excluded)
const inputScreens = Object.values(formSchema.screens)
  .filter((s) => s.inputType !== 'computed' && s.id !== 'result')
  .map((s) => s.id);

export function ProgressIndicator() {
  const currentScreenId = useSessionStore((s) => s.currentScreenId);

  if (!currentScreenId || currentScreenId === 'result') return null;

  const index = inputScreens.indexOf(currentScreenId);
  if (index === -1) return null;

  const step = index + 1;
  const total = inputScreens.length;
  const percent = (step / total) * 100;

  return (
    <div className="space-y-2" data-testid="progress-indicator">
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>
          Step {step} of {total}
        </span>
      </div>
      <Progress value={percent} aria-label={`Step ${step} of ${total}`} />
    </div>
  );
}
