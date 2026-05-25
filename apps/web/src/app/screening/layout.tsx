import { ProgressIndicator } from '@/components/ProgressIndicator';
import { StoreHydrator } from '@/components/StoreHydrator';

export default function ScreeningLayout({ children }: { children: React.ReactNode }) {
  return (
    <StoreHydrator>
      <main className="min-h-screen p-6 max-w-2xl mx-auto">
        <div className="space-y-8">
          <ProgressIndicator />
          {children}
        </div>
      </main>
    </StoreHydrator>
  );
}
