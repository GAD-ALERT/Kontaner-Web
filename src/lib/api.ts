import type { Asset, ApiErrorPayload, UploadResponse } from '../types';

const API_BASE_URL: string =
  import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api';

/**
 * Uploads a single asset to the backend and returns the parsed asset record.
 *
 * @throws Error - When the server responds with a non-2xx status. The error
 *   message is taken from the response body's `error` field when present.
 */
export async function uploadAsset(file: File): Promise<Asset> {
  const formData = new FormData();
  formData.append('asset', file);
  formData.append('title', file.name);

  const response = await fetch(`${API_BASE_URL}/assets`, {
    method: 'POST',
    body: formData,
  });

  const payload: UploadResponse & ApiErrorPayload = await response.json();

  if (!response.ok) {
    throw new Error(payload.error ?? 'Upload failed');
  }

  return payload.asset;
}
