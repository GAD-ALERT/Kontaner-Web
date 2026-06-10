/**
 * Request/response payloads exchanged with the Kontaner backend.
 */

import type { Asset } from './asset.types';

/** Successful response from `POST /api/assets`. */
export interface UploadResponse {
  asset: Asset;
}

/** Standard error body returned by the API. */
export interface ApiErrorPayload {
  error?: string;
}
