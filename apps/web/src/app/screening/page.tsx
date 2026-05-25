'use client';

import { useEffect } from 'react';
import { useSession } from '@/hooks/useSession';
import { ScreenRenderer } from '@/components/form/ScreenRenderer';

export default function ScreeningPage() {
  const { sessionId, status, start, isLoading } = useSession();

  useEffect(() => {
    if (!sessionId && status === 'idle' && !isLoading) {
      start();
    }
  }, [sessionId, status, isLoading, start]);

  if (isLoading || !sessionId) {
    return (
      <p data-testid="loading" role="status" aria-live="polite">
        Loading…
      </p>
    );
  }

  return <ScreenRenderer />;
}
