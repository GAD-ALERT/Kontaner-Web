/**
 * Hash-based router types.
 */

/** Canonical app routes. Free-form strings are also accepted to allow
 *  query parameters (e.g. `/search?query=kente`). */
export type Route =
  | '/discover'
  | '/library'
  | '/collections'
  | '/search'
  | '/upload'
  | '/asset'
  | '/settings'
  | '/login'
  | (string & {});

/** Imperative navigation function passed down via props. */
export type NavigateFn = (route: Route) => void;
