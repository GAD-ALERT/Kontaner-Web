/**
 * Canonical app routes. Free-form strings are also accepted because
 * react-router pages may construct routes with params/query
 * (e.g. `/asset/kente-market-portrait`, `/search?q=kente`).
 */
export type Route =
  | '/'
  | '/discover'
  | '/library'
  | '/collections'
  | '/search'
  | '/upload'
  | '/asset'
  | '/settings'
  | '/login'
  | '/signup'
  | '/forgot'
  | (string & {});
