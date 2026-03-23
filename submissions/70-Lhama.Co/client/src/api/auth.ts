const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

export interface ProviderStatus {
  connected: boolean;
  configured: boolean;
  email?: string;
  displayName?: string;
  provider?: 'google' | 'microsoft';
  message?: string;
}

export interface AuthStatus {
  outlook: ProviderStatus;
  gmail: ProviderStatus;
}

/** Fetch status of both providers in parallel */
export async function fetchAuthStatus(): Promise<AuthStatus> {
  const [outlookRes, gmailRes] = await Promise.allSettled([
    fetch(`${API_URL}/api/auth/status`, { signal: AbortSignal.timeout(5000) }),
    fetch(`${API_URL}/api/auth/google/status`, { signal: AbortSignal.timeout(5000) }),
  ]);

  const outlook: ProviderStatus = outlookRes.status === 'fulfilled' && outlookRes.value.ok
    ? await outlookRes.value.json()
    : { connected: false, configured: false };

  const gmail: ProviderStatus = gmailRes.status === 'fulfilled' && gmailRes.value.ok
    ? await gmailRes.value.json()
    : { connected: false, configured: false };

  return { outlook, gmail };
}

/** Navigate to Microsoft OAuth login */
export function triggerOutlookLogin(): void {
  window.location.href = `${API_URL}/api/auth/login`;
}

/** Navigate to Google OAuth login */
export function triggerGmailLogin(): void {
  window.location.href = `${API_URL}/api/auth/google/login`;
}

/** Disconnect Outlook */
export async function logoutOutlook(): Promise<void> {
  await fetch(`${API_URL}/api/auth/logout`, {
    method: 'POST',
    signal: AbortSignal.timeout(5000),
  });
}

/** Disconnect Gmail */
export async function logoutGmail(): Promise<void> {
  await fetch(`${API_URL}/api/auth/google/logout`, {
    method: 'POST',
    signal: AbortSignal.timeout(5000),
  });
}
