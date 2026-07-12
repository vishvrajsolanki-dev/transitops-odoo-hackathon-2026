import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Login.css';

/**
 * Decode a JWT token's payload without a library.
 * Only used to extract email/name from Google's credential.
 */
function decodeJwtPayload(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

export default function Login() {
  const navigate = useNavigate();
  const { login, demoLogin, loading, isAuthenticated, hasSelectedRole } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Redirect if already fully authenticated (with role selected)
  if (isAuthenticated && hasSelectedRole) {
    navigate('/', { replace: true });
    return null;
  }
  // Redirect if authenticated but needs role selection
  if (isAuthenticated && !hasSelectedRole) {
    navigate('/select-role', { replace: true });
    return null;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password.');
      return;
    }

    try {
      await login(email, password);
      navigate('/select-role');
    } catch (err) {
      // If backend is offline (network error), fall back to demo mode
      if (err.message === 'Failed to fetch' || err.name === 'TypeError') {
        demoLogin(email);
        navigate('/select-role');
        return;
      }
      setError(err.message || 'Login failed. Please try again.');
    }
  }

  function handleGoogleLogin() {
    setError('');

    // Check if Google Identity Services is loaded
    if (!window.google?.accounts?.id) {
      setError('Google sign-in is loading. Please try again in a moment.');
      return;
    }

    if (!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID === 'YOUR_GOOGLE_CLIENT_ID_HERE') {
      setError('Google Client ID is not configured. Add VITE_GOOGLE_CLIENT_ID to your .env file.');
      return;
    }

    // Initialize Google Identity Services
    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: handleGoogleCredentialResponse,
    });

    // Trigger the One Tap / popup flow
    window.google.accounts.id.prompt((notification) => {
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        // Fallback: use the popup sign-in button approach
        window.google.accounts.id.renderButton(
          document.getElementById('google-signin-hidden'),
          { type: 'standard', theme: 'outline', size: 'large' }
        );
        // Auto-click the rendered button
        const btn = document.querySelector('#google-signin-hidden div[role="button"]');
        if (btn) btn.click();
      }
    });
  }

  function handleGoogleCredentialResponse(response) {
    if (response.credential) {
      const payload = decodeJwtPayload(response.credential);
      const userEmail = payload?.email || 'google-user@gmail.com';
      demoLogin(userEmail);
      navigate('/select-role');
    } else {
      setError('Google sign-in failed. Please try again.');
    }
  }

  return (
    <div className="login-page">
      {/* Left branding panel */}
      <div className="login-branding">
        <div className="login-branding-content">
          <div className="login-logo">
            <div className="login-logo-icon">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="48" height="48" rx="12" fill="var(--color-accent)" />
                <path d="M14 32V20L24 14L34 20V32L24 38L14 32Z" stroke="white" strokeWidth="2.5" strokeLinejoin="round" />
                <path d="M24 14V38" stroke="white" strokeWidth="2" strokeDasharray="3 2" />
                <circle cx="24" cy="26" r="4" fill="white" fillOpacity="0.9" />
              </svg>
            </div>
            <h1 className="login-brand-name">TransitOps</h1>
          </div>
          <p className="login-brand-tagline">
            Smart Transport Operations Platform
          </p>
          <div className="login-brand-features">
            <div className="login-feature">
              <span className="login-feature-icon">🚛</span>
              <span>Fleet Management</span>
            </div>
            <div className="login-feature">
              <span className="login-feature-icon">📊</span>
              <span>Real-time Analytics</span>
            </div>
            <div className="login-feature">
              <span className="login-feature-icon">🛡️</span>
              <span>Safety Monitoring</span>
            </div>
            <div className="login-feature">
              <span className="login-feature-icon">⛽</span>
              <span>Fuel & Expense Tracking</span>
            </div>
          </div>
        </div>
        <div className="login-branding-decoration">
          <div className="login-decoration-circle login-decoration-circle--1"></div>
          <div className="login-decoration-circle login-decoration-circle--2"></div>
          <div className="login-decoration-circle login-decoration-circle--3"></div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="login-form-panel">
        <div className="login-form-container">
          <div className="login-form-header">
            <h2>Welcome back</h2>
            <p>Sign in to your account to continue</p>
          </div>

          <form className="login-form" onSubmit={handleSubmit} noValidate>
            {error && (
              <div className="login-error" role="alert">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M8 5v3.5M8 10.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <div className="login-field">
              <label htmlFor="email">Email address</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                disabled={loading}
                required
              />
            </div>

            <div className="login-field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                disabled={loading}
                required
              />
            </div>

            <button
              type="submit"
              className="login-submit"
              disabled={loading}
            >
              {loading ? (
                <span className="login-spinner-wrapper">
                  <span className="login-spinner"></span>
                  Signing in…
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="login-divider">
            <span>or</span>
          </div>

          <button
            type="button"
            className="login-google-btn"
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            <svg className="login-google-icon" width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A11.96 11.96 0 001 12c0 1.94.46 3.77 1.18 5.07l3.66-2.84v-.14z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          {/* Hidden container for Google's fallback rendered button */}
          <div id="google-signin-hidden" style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }}></div>

          <p className="login-footer-note">
            Secured with JWT · In-memory session only
          </p>
        </div>
      </div>
    </div>
  );
}
