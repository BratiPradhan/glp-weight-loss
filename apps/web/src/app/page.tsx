'use client';

import { useRouter } from 'next/navigation';
import { useSessionStore } from '@/store/session-store';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  const router = useRouter();
  const reset = useSessionStore((s) => s.reset);

  const start = () => {
    reset();
    router.push('/screening');
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md w-full space-y-6 text-center">
        <h1 className="text-3xl font-semibold">GLP-1 Eligibility Screening</h1>
        <p className="text-muted-foreground">
          Answer a few questions to see whether GLP-1 medication may be appropriate for you. Your
          answers are saved as you go.
        </p>
        <Button onClick={start} data-testid="start-button" size="lg">
          Start Screening
        </Button>
      </div>
    </main>
  );
}
