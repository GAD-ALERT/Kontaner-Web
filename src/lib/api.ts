const API_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api').replace(/\/$/, '');

const TOKEN_KEY = 'kontaner.token';
export const SESSION_EXPIRED_EVENT = 'kontaner:session-expired';

export class ApiError extends Error {
  readonly status: number;
  readonly code?: string;

  constructor(
    message: string,
    status: number,
    code?: string,
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

export const sessionToken = {
  get: (): string | null => localStorage.getItem(TOKEN_KEY),
  set: (token: string): void => localStorage.setItem(TOKEN_KEY, token),
  clear: (): void => localStorage.removeItem(TOKEN_KEY),
};

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  auth?: boolean;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, auth = false, headers: suppliedHeaders, ...init } = options;
  const headers = new Headers(suppliedHeaders);
  const token = sessionToken.get();

  if (auth && token) headers.set('Authorization', `Bearer ${token}`);
  if (body !== undefined && !(body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers,
    body: body === undefined
      ? undefined
      : body instanceof FormData
        ? body
        : JSON.stringify(body),
  });

  const payload = await response.json().catch(() => null) as
    | { error?: string; code?: string }
    | null;

  if (!response.ok) {
    if (response.status === 401 && auth) {
      sessionToken.clear();
      window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
    }
    throw new ApiError(payload?.error ?? `Request failed (${response.status})`, response.status, payload?.code);
  }

  return payload as T;
}

interface UploadStreamHandlers<T> {
  onStatus?: (data: { stage: string; url?: string }) => void;
  onTag?: (data: { tag: string }) => void;
  onInsight?: (data: { insight: string }) => void;
  onDone?: (data: T) => void;
}

export async function apiStreamUpload<T>(
  file: File,
  handlers: UploadStreamHandlers<T>,
  signal?: AbortSignal,
): Promise<T> {
  const form = new FormData();
  form.append('file', file);
  const token = sessionToken.get();
  const response = await fetch(`${API_URL}/uploads/stream`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: form,
    signal,
  });

  if (!response.ok || !response.body) {
    if (response.status === 401) {
      sessionToken.clear();
      window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
    }
    const payload = await response.json().catch(() => null) as { error?: string } | null;
    throw new ApiError(payload?.error ?? 'Upload failed', response.status);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let completed: T | undefined;

  while (true) {
    const { done, value } = await reader.read();
    buffer += decoder.decode(value, { stream: !done });
    const frames = buffer.split(/\r?\n\r?\n/);
    buffer = frames.pop() ?? '';

    for (const frame of frames) {
      const event = frame.match(/^event:\s*(.+)$/m)?.[1]?.trim();
      const dataText = frame.match(/^data:\s*(.+)$/m)?.[1];
      if (!event || !dataText) continue;
      const data = JSON.parse(dataText) as Record<string, unknown>;
      if (event === 'status') handlers.onStatus?.(data as { stage: string; url?: string });
      if (event === 'tag') handlers.onTag?.(data as { tag: string });
      if (event === 'insight') handlers.onInsight?.(data as { insight: string });
      if (event === 'done') {
        completed = data as T;
        handlers.onDone?.(completed);
      }
      if (event === 'error') throw new ApiError(String(data.message ?? 'Upload failed'), Number(data.status ?? 500));
    }
    if (done) break;
  }

  if (!completed) throw new ApiError('Upload ended before completion', 500);
  return completed;
}
