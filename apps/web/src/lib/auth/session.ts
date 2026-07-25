import { cache } from 'react';
import { validateSession } from '@leadlens/auth';
import { getSessionCookie } from '../auth-cookies';
import { redirect } from 'next/navigation';

export const getSession = cache(async () => {
  const token = await getSessionCookie();
  
  if (!token) {
    return null;
  }
  
  try {
    const sessionData = await validateSession(token);
    return sessionData;
  } catch (err) {
    console.error('Failed to validate session:', err);
    return null;
  }
});

export const requireSession = cache(async () => {
  const session = await getSession();
  
  if (!session) {
    redirect('/login');
  }
  
  return session;
});
