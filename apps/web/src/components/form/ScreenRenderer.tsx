// apps/web/src/components/form/ScreenRenderer.tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { formSchema, getAnswerSchema, type Screen } from '@glp1/shared';
import { Button } from '@/components/ui/button';
import { useSession } from '@/hooks/useSession';
import { NumberInput } from './inputs/NumberInput';
import { RadioInput } from './inputs/RadioInput';
import { CheckboxInput } from './inputs/CheckboxInput';

type FormValues = { value: number | string | string[] };

export function ScreenRenderer() {
  const { currentScreenId, isSubmitting, submit, submitError } = useSession();

  if (!currentScreenId) return null;

  const screen = formSchema.screens[currentScreenId];

  if (screen.inputType === 'computed') return null;

  return (
    <ScreenForm
      key={currentScreenId}
      screen={screen}
      isSubmitting={isSubmitting}
      onSubmit={submit}
      apiError={submitError}
    />
  );
}

function ScreenForm({
  screen,
  isSubmitting,
  onSubmit,
  apiError,
}: {
  screen: Screen;
  isSubmitting: boolean;
  onSubmit: (value: unknown) => void;
  apiError: unknown;
}) {
  // Pull the per-screen Zod schema from shared, wrap it in `{ value: ... }`
  // because react-hook-form needs a single object schema.
  const answerSchema = getAnswerSchema(screen.id as never);
  const wrappedSchema = z.object({ value: answerSchema });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(wrappedSchema),
    defaultValues: { value: defaultForScreen(screen) },
  });

  const currentValue = watch('value');
  const valueError = errors.value?.message as string | undefined;

  return (
    <form
      onSubmit={handleSubmit(({ value }) => onSubmit(value))}
      noValidate
      className="space-y-6"
      data-testid={`screen-${screen.id}`}
    >
      <div>
        <h1 className="text-2xl font-semibold mb-2">{screen.title}</h1>
        {screen.prompt && <p className="text-base text-muted-foreground">{screen.prompt}</p>}
      </div>

      <div>
        {screen.inputType === 'number' && (
          <NumberInput screen={screen} register={register} error={valueError} />
        )}

        {screen.inputType === 'radio' && (
          <RadioInput
            screen={screen}
            value={(currentValue as string) ?? ''}
            onChange={(v) => setValue('value', v, { shouldValidate: true, shouldDirty: true })}
            error={valueError}
          />
        )}

        {screen.inputType === 'checkbox' && (
          <CheckboxInput
            screen={screen}
            value={(currentValue as string[]) ?? []}
            onChange={(v) => setValue('value', v, { shouldValidate: true, shouldDirty: true })}
            error={valueError}
          />
        )}
      </div>

      {apiError != null && (
        <div role="alert" className="text-sm text-red-600">
          {(apiError as Error).message}
        </div>
      )}

      <Button type="submit" disabled={isSubmitting} data-testid="next-button">
        {isSubmitting ? 'Saving…' : 'Next'}
      </Button>
    </form>
  );
}

function defaultForScreen(screen: Screen): FormValues['value'] {
  switch (screen.inputType) {
    case 'number':
      return '' as unknown as number;
    case 'radio':
      return '';
    case 'checkbox':
      return [];
    case 'computed':
      return '';
  }
}
