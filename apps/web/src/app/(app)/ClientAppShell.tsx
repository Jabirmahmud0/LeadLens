'use client';

import { AppShell } from '@leadlens/ui/client';
import { useCallback, useEffect, useRef } from 'react';

const SESSION_CHECK_INTERVAL_MS = 20_000;

function SessionEnforcer() {
  const redirecting = useRef(false);

  const checkSession = useCallback(async () => {
    if (redirecting.current) return;

    try {
      const response = await fetch('/api/auth/session', {
        cache: 'no-store',
        credentials: 'same-origin',
        headers: { accept: 'application/json' },
      });

      if (response.status !== 401 && response.status !== 403) return;

      redirecting.current = true;
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { accept: 'application/json' },
      }).catch(() => undefined);
      window.location.replace('/login?reason=access-revoked');
    } catch {
      // A transient network failure must not sign the user out. Protected
      // requests still validate the session independently on the server.
    }
  }, []);

  useEffect(() => {
    void checkSession();
    const interval = window.setInterval(() => void checkSession(), SESSION_CHECK_INTERVAL_MS);
    const checkWhenVisible = () => {
      if (document.visibilityState === 'visible') void checkSession();
    };

    window.addEventListener('focus', checkSession);
    document.addEventListener('visibilitychange', checkWhenVisible);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener('focus', checkSession);
      document.removeEventListener('visibilitychange', checkWhenVisible);
    };
  }, [checkSession]);

  return null;
}

export function ClientAppShell({ sidebar, children }: { sidebar: React.ReactNode; children: React.ReactNode }) {
  return <AppShell sidebar={sidebar} tone="light" className="authenticated-light"><SessionEnforcer />{children}</AppShell>;
}
