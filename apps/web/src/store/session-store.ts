import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { EligibilityResult, ScreenId } from '@glp1/shared';

type AnswerValue = number | string | string[];

type SessionStore = {
  sessionId: string | null;
  currentScreenId: ScreenId | null;
  answers: Record<string, AnswerValue>;
  status: 'idle' | 'in-progress' | 'completed';
  result: EligibilityResult | null;

  setSessionId: (id: string | null) => void;
  setCurrentScreen: (id: ScreenId) => void;
  setAnswer: (screenId: string, value: AnswerValue) => void;
  setAnswers: (answers: Record<string, AnswerValue>) => void;
  setResult: (result: EligibilityResult) => void;
  hydrate: (s: {
    sessionId: string;
    currentScreenId: ScreenId | null;
    answers: Record<string, AnswerValue>;
    status: 'in-progress' | 'completed';
    result: EligibilityResult | null;
  }) => void;
  reset: () => void;
};

const initial = {
  sessionId: null,
  currentScreenId: null,
  answers: {},
  status: 'idle' as const,
  result: null,
};

export const useSessionStore = create<SessionStore>()(
  persist(
    (set) => ({
      ...initial,
      setSessionId: (id) => set({ sessionId: id }),
      setCurrentScreen: (id) => set({ currentScreenId: id, status: 'in-progress' }),
      setAnswer: (screenId, value) =>
        set((s) => ({ answers: { ...s.answers, [screenId]: value } })),
      setAnswers: (answers) => set({ answers }),
      setResult: (result) => set({ result, status: 'completed' }),
      hydrate: (s) =>
        set({
          sessionId: s.sessionId,
          currentScreenId: s.currentScreenId,
          answers: s.answers,
          status: s.status,
          result: s.result,
        }),
      reset: () => set(initial),
    }),
    {
      name: 'glp1-session',
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ sessionId: s.sessionId }),
      skipHydration: true,
    },
  ),
);
