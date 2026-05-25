'use client';

import { useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { api, ApiError } from '@/lib/api-client';
import { useSessionStore } from '@/store/session-store';
import type { ScreenId } from '@glp1/shared';

export function useSession() {
  const router = useRouter();
  const {
    sessionId,
    currentScreenId,
    answers,
    status,
    result,
    setSessionId,
    setCurrentScreen,
    setAnswer,
    setResult,
    hydrate,
    reset,
  } = useSessionStore();

  // Resume an existing session on mount
  const resumeQuery = useQuery({
    queryKey: ['session', sessionId],
    queryFn: async () => {
      if (!sessionId) return null;
      try {
        return await api.getSession(sessionId);
      } catch (err) {
        if (err instanceof ApiError && err.status === 404) {
          reset();
          return null;
        }
        throw err;
      }
    },
    enabled: !!sessionId && status === 'idle',
  });

  // When resume succeeds, push the server's view into the store
  useEffect(() => {
    const data = resumeQuery.data;
    if (!data) return;
    hydrate({
      sessionId: data.sessionId,
      currentScreenId: data.currentScreenId as ScreenId | null,
      answers: data.answers as Record<string, number | string | string[]>,
      status: data.status,
      result: data.result,
    });
    if (data.status === 'completed') {
      router.replace('/result');
    }
  }, [resumeQuery.data, hydrate, router]);

  // Start a brand-new session
  const startMutation = useMutation({
    mutationFn: api.startSession,
    onSuccess: (data) => {
      setSessionId(data.sessionId);
      setCurrentScreen(data.currentScreenId as ScreenId);
    },
  });

  // Submit an answer to the current screen
  const submitMutation = useMutation({
    mutationFn: ({ value }: { value: unknown }) => {
      if (!sessionId || !currentScreenId) {
        throw new Error('No active session');
      }
      return api.submitAnswer(sessionId, currentScreenId, value);
    },
    onSuccess: (response, { value }) => {
      if (!currentScreenId) return;
      setAnswer(currentScreenId, value as number | string | string[]);
      if (response.type === 'next') {
        setCurrentScreen(response.nextScreenId as ScreenId);
      } else {
        setResult(response.result);
        router.push('/result');
      }
    },
  });

  return {
    sessionId,
    currentScreenId,
    answers,
    status,
    result,
    isLoading: resumeQuery.isLoading || startMutation.isPending,
    isSubmitting: submitMutation.isPending,
    submitError: submitMutation.error,
    start: () => startMutation.mutate(),
    submit: (value: unknown) => submitMutation.mutate({ value }),
    reset,
  };
}
