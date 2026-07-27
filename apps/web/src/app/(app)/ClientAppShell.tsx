'use client';

import { AppShell } from '@leadlens/ui/client';

export function ClientAppShell({ sidebar, children }: { sidebar: React.ReactNode; children: React.ReactNode }) {
  return <AppShell sidebar={sidebar} tone="light" className="authenticated-light">{children}</AppShell>;
}
