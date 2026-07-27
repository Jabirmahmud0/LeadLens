function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function getPlatformAdminEmails(value = process.env.ADMIN_EMAILS): Set<string> {
  return new Set(
    (value ?? '')
      .split(',')
      .map(normalizeEmail)
      .filter(Boolean),
  );
}

export function isPlatformAdmin(email: string | null | undefined): boolean {
  if (!email) return false;
  return getPlatformAdminEmails().has(normalizeEmail(email));
}
