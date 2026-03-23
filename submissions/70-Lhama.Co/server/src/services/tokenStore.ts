/**
 * In-memory token store for Microsoft OAuth tokens.
 * Single-user approach suitable for a hackathon demo.
 * In production you'd use a proper session store + database.
 */

interface TokenSet {
  accessToken: string;
  refreshToken: string;
  expiresAt: number; // Unix timestamp ms
  userEmail: string;
  userDisplayName: string;
}

let currentTokens: TokenSet | null = null;

export function storeTokens(tokens: TokenSet): void {
  currentTokens = tokens;
  console.log(`[tokenStore] Stored tokens for ${tokens.userEmail}, expires in ${Math.round((tokens.expiresAt - Date.now()) / 60000)} minutes`);
}

export function getTokens(): TokenSet | null {
  return currentTokens;
}

export function clearTokens(): void {
  const email = currentTokens?.userEmail ?? 'unknown';
  currentTokens = null;
  console.log(`[tokenStore] Cleared tokens for ${email}`);
}

export function isAuthenticated(): boolean {
  return currentTokens !== null;
}

export function isTokenExpired(): boolean {
  if (!currentTokens) return true;
  // Refresh 5 minutes before actual expiry
  return Date.now() >= currentTokens.expiresAt - 5 * 60 * 1000;
}

export function getAccessToken(): string | null {
  return currentTokens?.accessToken ?? null;
}

export function getAuthStatus(): { connected: boolean; email?: string; displayName?: string } {
  if (!currentTokens) return { connected: false };
  return {
    connected: true,
    email: currentTokens.userEmail,
    displayName: currentTokens.userDisplayName,
  };
}
