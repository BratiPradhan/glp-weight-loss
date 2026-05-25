import type { StartSessionResponse, SubmitAnswerResponse, GetSessionResponse } from '@glp1/shared';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';

class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(res.status, body.message ?? res.statusText);
  }

  return res.json() as Promise<T>;
}

export const api = {
  startSession: () =>
    request<StartSessionResponse>('/session/start', {
      method: 'POST',
      body: JSON.stringify({}),
    }),

  submitAnswer: (sessionId: string, screenId: string, value: unknown) =>
    request<SubmitAnswerResponse>('/session/answer', {
      method: 'POST',
      body: JSON.stringify({ sessionId, screenId, value }),
    }),

  getSession: (id: string) => request<GetSessionResponse>(`/session/${id}`),
};

export { ApiError };
