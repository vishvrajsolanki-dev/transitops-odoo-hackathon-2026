// API client for auth — talks to backend /api/auth
// This is the ONLY file allowed to call the login endpoint.
import { apiBaseUrl } from '../utils/apiConfig';

/**
 * Authenticate a user via the backend login endpoint.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{ token: string, user: { id: string, email: string, role: string } }>}
 */
export async function loginUser(email, password) {
  const response = await fetch(`${apiBaseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const body = await response.json();

  // Backend wraps everything in { success, data } or { success, error }
  if (!body.success) {
    throw new Error(body.error?.message || 'Login failed');
  }

  return body.data; // { token, user: { id, email, role } }
}

/**
 * Authenticate via Google OAuth.
 * TODO: backend Google OAuth endpoint — stub for now.
 * When ready, this should redirect to backend OAuth flow or handle
 * the Google ID token exchange.
 */
export async function googleLogin() {
  // TODO: Replace with actual backend Google OAuth endpoint once available.
  // Expected flow: redirect to backend /api/auth/google or exchange Google ID token.
  throw new Error('Google sign-in is not yet available. Please use email and password.');
}
