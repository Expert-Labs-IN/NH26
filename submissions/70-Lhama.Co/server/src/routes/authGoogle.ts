import { Router } from 'express';
import {
  storeGoogleTokens,
  clearGoogleTokens,
  getGoogleAuthStatus,
} from '../services/googleTokenStore';
import { getGoogleUserProfile } from '../services/gmailService';

const router = Router();

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID ?? '';
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET ?? '';
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI ?? 'http://localhost:3001/api/auth/google/callback';
const FRONTEND_URL = process.env.ALLOWED_ORIGIN ?? 'http://localhost:5173';

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';

// All scopes needed for full functionality
const SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',       // Read inbox
  'https://www.googleapis.com/auth/gmail.send',           // Send emails
  'https://www.googleapis.com/auth/calendar.events',      // Create calendar events
  'https://www.googleapis.com/auth/tasks',                // Create tasks
  'https://www.googleapis.com/auth/userinfo.email',       // Get email address
  'https://www.googleapis.com/auth/userinfo.profile',     // Get display name
].join(' ');

// ─── GET /api/auth/google/login ───────────────────────────────────────────────

router.get('/login', (req, res) => {
  if (!CLIENT_ID) {
    return res.status(500).json({
      error: 'GOOGLE_NOT_CONFIGURED',
      message: 'GOOGLE_CLIENT_ID is not set in .env — see GMAIL_SETUP.md',
    });
  }

  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: 'code',
    scope: SCOPES,
    access_type: 'offline',   // Required to get refresh_token
    prompt: 'consent',        // Always show consent to get refresh_token every time
    state: Math.random().toString(36).slice(2),
  });

  console.log('[auth/google] Redirecting to Google OAuth...');
  res.redirect(`${GOOGLE_AUTH_URL}?${params.toString()}`);
});

// ─── GET /api/auth/google/callback ────────────────────────────────────────────

router.get('/callback', async (req, res) => {
  const { code, error } = req.query as Record<string, string>;

  if (error) {
    console.error(`[auth/google] OAuth error: ${error}`);
    return res.redirect(`${FRONTEND_URL}?gmail_error=${encodeURIComponent(error)}`);
  }

  if (!code) {
    return res.redirect(`${FRONTEND_URL}?gmail_error=no_code`);
  }

  try {
    // Exchange auth code for tokens
    const tokenParams = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      code,
      redirect_uri: REDIRECT_URI,
    });

    const tokenRes = await fetch(GOOGLE_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: tokenParams.toString(),
      signal: AbortSignal.timeout(10_000),
    });

    if (!tokenRes.ok) {
      const err = await tokenRes.text();
      throw new Error(`Google token exchange failed: ${err}`);
    }

    const tokenData = await tokenRes.json() as {
      access_token: string;
      refresh_token?: string;
      expires_in: number;
    };

    if (!tokenData.refresh_token) {
      // This happens if the user already granted access and prompt=consent wasn't forced
      throw new Error('No refresh token received. Please revoke app access in Google Account settings and try again.');
    }

    // Store tokens temporarily to fetch profile
    storeGoogleTokens({
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      expiresAt: Date.now() + tokenData.expires_in * 1000,
      userEmail: 'loading...',
      userDisplayName: 'Loading...',
    });

    // Fetch user profile
    const profile = await getGoogleUserProfile();

    // Store final tokens with real user info
    storeGoogleTokens({
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      expiresAt: Date.now() + tokenData.expires_in * 1000,
      userEmail: profile.email,
      userDisplayName: profile.name,
    });

    console.log(`[auth/google] Successfully authenticated: ${profile.email}`);
    res.redirect(
      `${FRONTEND_URL}?gmail_connected=true&gmail_user=${encodeURIComponent(profile.email)}`
    );

  } catch (err) {
    console.error('[auth/google] Token exchange error:', err);
    clearGoogleTokens();
    res.redirect(
      `${FRONTEND_URL}?gmail_error=${encodeURIComponent((err as Error).message)}`
    );
  }
});

// ─── GET /api/auth/google/status ──────────────────────────────────────────────

router.get('/status', (_req, res) => {
  const status = getGoogleAuthStatus();

  if (!CLIENT_ID) {
    return res.json({
      connected: false,
      configured: false,
      message: 'Google OAuth not configured — add GOOGLE_CLIENT_ID to .env',
    });
  }

  res.json({ ...status, configured: true });
});

// ─── POST /api/auth/google/logout ─────────────────────────────────────────────

router.post('/logout', (_req, res) => {
  clearGoogleTokens();
  res.json({ success: true, message: 'Disconnected from Gmail' });
});

export default router;
