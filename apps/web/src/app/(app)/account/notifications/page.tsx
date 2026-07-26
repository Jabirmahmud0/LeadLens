import * as React from 'react';
import { getSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { Bell, Mail, ShieldAlert, Sparkles } from 'lucide-react';
import { updateNotificationPreferences } from './actions';

export const metadata = {
  title: 'Notifications | Account | LeadLens',
};

export default async function NotificationsPage() {
  const session = await getSession();
  if (!session || !session.user) redirect('/login');

  return (
    <div className="space-y-8">
      
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-neutral-800 flex items-center justify-center shrink-0">
            <Bell className="w-5 h-5 text-neutral-400" />
          </div>
          <div>
            <h2 className="text-xl font-medium text-white">Email Notifications</h2>
            <p className="text-sm text-neutral-400">Choose what updates you want to receive in your inbox.</p>
          </div>
        </div>
        
        <form action={updateNotificationPreferences} className="space-y-6">
          
          {/* Analysis Reports */}
          <div className="flex items-start justify-between gap-4 py-4 border-b border-neutral-800">
            <div className="flex items-start gap-4">
              <Mail className="w-5 h-5 text-blue-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-white">Report Completions</p>
                <p className="text-xs text-neutral-400 mt-1 max-w-sm">
                  Receive an email when a prospect analysis finishes generating, including a link to the results.
                </p>
              </div>
            </div>
            <input name="reportCompletionEmails" type="checkbox" defaultChecked={session.user.reportCompletionEmails} className="h-5 w-5 accent-blue-600" aria-label="Report completion emails" />
          </div>

          {/* Product Updates */}
          <div className="flex items-start justify-between gap-4 py-4 border-b border-neutral-800">
            <div className="flex items-start gap-4">
              <Sparkles className="w-5 h-5 text-purple-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-white">Product Updates</p>
                <p className="text-xs text-neutral-400 mt-1 max-w-sm">
                  Occasional emails about new features, AI model upgrades, and platform improvements.
                </p>
              </div>
            </div>
            <input name="productUpdateEmails" type="checkbox" defaultChecked={session.user.productUpdateEmails} className="h-5 w-5 accent-blue-600" aria-label="Product update emails" />
          </div>

          {/* Security Alerts (Disabled toggle) */}
          <div className="flex items-start justify-between gap-4 py-4">
            <div className="flex items-start gap-4">
              <ShieldAlert className="w-5 h-5 text-neutral-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-neutral-300">Security & Alerts</p>
                <p className="text-xs text-neutral-500 mt-1 max-w-sm">
                  Important emails regarding your account security, login attempts, and billing. These cannot be turned off.
                </p>
              </div>
            </div>
            <input type="checkbox" checked readOnly disabled className="h-5 w-5 accent-neutral-500" aria-label="Security emails always enabled" />
          </div>

          <button type="submit" className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-black hover:bg-neutral-200">Save preferences</button>
        </form>
      </div>
      
    </div>
  );
}
