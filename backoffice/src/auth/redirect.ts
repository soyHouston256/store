/**
 * Hard redirect to /login preserving where the user was (`from` query param).
 * Lives in its own module so the api client (outside the Router) can trigger it
 * and tests can mock it.
 */
export function redirectToLogin(from: string): void {
  window.location.assign(`/login?from=${encodeURIComponent(from)}`);
}
