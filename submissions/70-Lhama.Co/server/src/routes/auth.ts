import { Router } from 'express';
import { storeTokens, clearTokens, getAuthStatus } from '../services/tokenStore';
import { getUserProfile } from '../services/graphService';

const router = Router();

const CLIENT_ID = process.env.MICROSOFT_CLIENT_ID ?? '';
const CLIENT_SECRET = process.env.MICROSOFT_CLIENT_SECRET ?? '';
const REDIRECT_URI = process.env.MICROSOFT_REDIRECT_URI ?? 'http://localhost:3001/api/auth/callback';
const FRONTEND_URL = process.env.ALLOWED_ORIGIN ?? 'http://localhost:5173';
const MS_AUTH_URL = 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize';
const MS_TOKEN_URL = 'https://login.microsoftonline.com/common/oauth2/v2.0/token';

// Scopes required for full functionality
const SCOPES = [
  'offline_access',    // Refresh tokens
  'Mail.Read',         // Read inbox emails
  'Mail.Send',         // Send reply emails
  'Calendars.ReadWrite', // Create calendar events
  'Tasks.ReadWrite',   // Create To-Do tasks
  'User.Read',         // Get user profile
].join(' ');

// ─── GET /api/auth/login ──────────────────────────────────────────────────────
// Redirects browser to Microsoft OAuth consent screen

router.get('/login', (req, res) => {
  if (!CLIENT_ID) {
    return res.status(500).json({
      error: 'MICROSOFT_NOT_CONFIGURED',
      message: 'MICROSOFT_CLIENT_ID is not set in .env — see setup guide',
    });
  }

  // Simple state for CSRF protection
  const state = Math.random().toString(36).slice(2);

  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: 'code',
    redirect_uri: REDIRECT_URI,
    scope: SCOPES,
    response_mode: 'query',
    state,
    prompt: 'select_account', // Always show account picker
  });

  const authUrl = `${MS_AUTH_URL}?${params.toString()}`;
  console.log(`[auth] Redirecting to Microsoft OAuth...`);
  res.redirect(authUrl);
});

// ─── GET /api/auth/callback ───────────────────────────────────────────────────
// Microsoft redirects here after user logs in

router.get('/callback', async (req, res) => {
  const { code, error, error_description } = req.query as Record<string, string>;

  if (error) {
    console.error(`[auth] OAuth error: ${error} — ${error_description}`);
    return res.redirect(`${FRONTEND_URL}?outlook_error=${encodeURIComponent(error_description ?? error)}`);
  }

  if (!code) {
    return res.redirect(`${FRONTEND_URL}?outlook_error=no_code`);
  }

  try {
    // Exchange auth code for tokens
    const tokenParams = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      code,
      redirect_uri: REDIRECT_URI,
      scope: SCOPES,
    });

    const tokenRes = await fetch(MS_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: tokenParams.toString(),
      signal: AbortSignal.timeout(10_000),
    });

    if (!tokenRes.ok) {
      const err = await tokenRes.text();
      throw new Error(`Token exchange failed: ${err}`);
    }

    const tokenData = await tokenRes.json() as {
      access_token: string;
      refresh_token: string;
      expires_in: number;
    };

    // Temporarily store tokens to fetch user profile
    storeTokens({
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      expiresAt: Date.now() + tokenData.expires_in * 1000,
      userEmail: 'loading...',
      userDisplayName: 'Loading...',
    });

    // Fetch user profile to get email + name
    const profile = await getUserProfile();
    const email = profile.mail ?? profile.userPrincipalName;

    // Store final tokens with real user info
    storeTokens({
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      expiresAt: Date.now() + tokenData.expires_in * 1000,
      userEmail: email,
      userDisplayName: profile.displayName,
    });

    console.log(`[auth] Successfully authenticated: ${email}`);
    res.redirect(`${FRONTEND_URL}?outlook_connected=true&user=${encodeURIComponent(email)}`);

  } catch (err) {
    console.error('[auth] Token exchange error:', err);
    clearTokens();
    res.redirect(`${FRONTEND_URL}?outlook_error=${encodeURIComponent((err as Error).message)}`);
  }
});

// ─── GET /api/auth/status ─────────────────────────────────────────────────────
// Returns current authentication status — polled by frontend

router.get('/status', (_req, res) => {
  const status = getAuthStatus();

  if (!CLIENT_ID) {
    return res.json({
      connected: false,
      configured: false,
      message: 'Microsoft OAuth not configured — add MICROSOFT_CLIENT_ID to .env',
    });
  }

  res.json({
    ...status,
    configured: true,
  });
});

// ─── POST /api/auth/logout ────────────────────────────────────────────────────
// Clears tokens and disconnects Outlook

router.post('/logout', (_req, res) => {
  clearTokens();
  res.json({ success: true, message: 'Disconnected from Outlook' });
});

export default router;
