'use client';

import { useRouter } from 'next/navigation';
import { useSessionStore } from '@/store/session-store';
import { Button } from '@/components/ui/button';
import { StoreHydrator } from '@/components/StoreHydrator';

function ResultContent() {
  const router = useRouter();
  const { result, reset } = useSessionStore();

  if (!result) {
    return (
      <main className="p-6 max-w-2xl mx-auto">
        <p>No result available.</p>
        <Button onClick={() => router.push('/')}>Start over</Button>
      </main>
    );
  }

  const startOver = () => {
    reset();
    router.push('/');
  };

  return (
    <main className="min-h-screen p-6 max-w-2xl mx-auto space-y-6">
      <div data-testid={`result-${result.status}`}>
        {result.status === 'eligible' && (
          <>
            <h1 className="text-3xl font-semibold text-green-700">Eligible</h1>
            <p className="mt-2 text-muted-foreground">
              Based on your responses, you may be a candidate for GLP-1 therapy. A clinician will
              follow up to confirm.
            </p>
          </>
        )}

        {result.status === 'ineligible' && (
          <>
            <h1 className="text-3xl font-semibold text-red-700">Not eligible</h1>
            <p className="mt-2 text-muted-foreground">
              Based on your responses, GLP-1 therapy is not appropriate at this time.
            </p>
            <p className="mt-4 text-sm">
              Reason: <span data-testid="result-reason">{result.reason}</span>
            </p>
          </>
        )}

        {result.status === 'clinical-review' && (
          <>
            <h1 className="text-3xl font-semibold text-amber-700">Clinical review required</h1>
            <p className="mt-2 text-muted-foreground">
              Your responses suggest factors that need clinician review before proceeding.
            </p>
            <ul className="mt-4 list-disc list-inside text-sm space-y-1">
              {result.reasons.map((r) => (
                <li key={r} data-testid={`result-reason-${r}`}>
                  {r}
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      <Button onClick={startOver} data-testid="restart-button" variant="outline">
        Start over
      </Button>
    </main>
  );
}

export default function ResultPage() {
  return (
    <StoreHydrator>
      <ResultContent />
    </StoreHydrator>
  );
}
