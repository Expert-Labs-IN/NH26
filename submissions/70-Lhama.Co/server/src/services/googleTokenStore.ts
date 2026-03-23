/**
 * In-memory token store for Google OAuth tokens.
 * Kept separate from Microsoft tokens so both can be active simultaneously.
 */

interface GoogleTokenSet {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  userEmail: string;
  userDisplayName: string;
}

let currentTokens: GoogleTokenSet | null = null;

export function storeGoogleTokens(tokens: GoogleTokenSet): void {
  currentTokens = tokens;
  console.log(`[googleTokenStore] Stored tokens for ${tokens.userEmail}`);
}

export function getGoogleTokens(): GoogleTokenSet | null {
  return currentTokens;
}

export function clearGoogleTokens(): void {
  const email = currentTokens?.userEmail ?? 'unknown';
  currentTokens = null;
  console.log(`[googleTokenStore] Cleared tokens for ${email}`);
}

export function isGoogleAuthenticated(): boolean {
  return currentTokens !== null;
}

export function isGoogleTokenExpired(): boolean {
  if (!currentTokens) return true;
  return Date.now() >= currentTokens.expiresAt - 5 * 60 * 1000;
}

export function getGoogleAccessToken(): string | null {
  return currentTokens?.accessToken ?? null;
}

export function getGoogleAuthStatus(): {
  connected: boolean;
  email?: string;
  displayName?: string;
  provider?: string;
} {
  if (!currentTokens) return { connected: false };
  return {
    connected: true,
    email: currentTokens.userEmail,
    displayName: currentTokens.userDisplayName,
    provider: 'google',
  };
}
