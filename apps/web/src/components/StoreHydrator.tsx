'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useSessionStore } from '@/store/session-store';

export function StoreHydrator({ children }: { children: ReactNode }) {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    (async () => {
      await useSessionStore.persist.rehydrate();
      setHydrated(true);
    })();
  }, []);

  if (!hydrated) {
    return (
      <p data-testid="loading" role="status" aria-live="polite">
        Loading…
      </p>
    );
  }

  return <>{children}</>;
}
